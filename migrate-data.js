const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// MongoDB Atlas connection string
const CLOUD_MONGO_URI = 'mongodb+srv://poreddysricharithareddy11:4ehNN0z7muNdWaD9@paywise-cluster.pcuedgz.mongodb.net/test?retryWrites=true&w=majority&appName=paywise-cluster';
 
// Define schemas to match your existing models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  upiId: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  balance: { type: Number, default: 10000 },
  categories: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['predefined', 'custom'], default: 'custom' },
    color: { type: String, default: '#007bff' }
  }],
  spendingLimits: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId },
    limit: { type: Number, required: true }
  }]
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  category: { type: String, default: 'Other' },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Helper function to convert MongoDB export format to Mongoose format
function convertObjectId(obj) {
  if (obj && typeof obj === 'object') {
    if (obj.$oid) {
      return obj.$oid; // Convert { $oid: '...' } to '...'
    }
    
    if (obj.$date) {
      return new Date(obj.$date); // Convert { $date: '...' } to Date object
    }
    
    // Recursively process nested objects and arrays
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => convertObjectId(item));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = convertObjectId(obj[key]);
      }
    }
  }
  return obj;
}

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(CLOUD_MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Read JSON files
    const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const transactionsData = JSON.parse(fs.readFileSync('transactions.json', 'utf8'));
    
    console.log(`Found ${usersData.length} users to migrate`);
    console.log(`Found ${transactionsData.length} transactions to migrate`);
    
    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data in cloud database');
    
    // Migrate users first and create mapping
    const migratedUsers = [];
    const userIdMapping = {};
    
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      
      // Store the original ID before conversion
      const originalId = userData._id.$oid;
      
      // Convert ObjectIds in the data
      const convertedUserData = convertObjectId(userData);
      
      // Remove _id to let MongoDB generate new ones
      delete convertedUserData._id;
      
      // Handle categories array
      if (convertedUserData.categories) {
        convertedUserData.categories = convertedUserData.categories.map(cat => {
          const convertedCat = convertObjectId(cat);
          delete convertedCat._id; // Remove _id to let MongoDB generate new ones
          return convertedCat;
        });
      }
      
      // Handle spendingLimits array
      if (convertedUserData.spendingLimits) {
        convertedUserData.spendingLimits = convertedUserData.spendingLimits.map(limit => {
          const convertedLimit = convertObjectId(limit);
          delete convertedLimit._id; // Remove _id to let MongoDB generate new ones
          return convertedLimit;
        });
      }
      
      const user = new User(convertedUserData);
      await user.save();
      migratedUsers.push(user);
      
      // Create mapping from original ID to new MongoDB ID
      userIdMapping[originalId] = user._id.toString();
      console.log(`Migrated user: ${user.name} (${user.upiId}) - ID: ${originalId} -> ${user._id}`);
    }
    
    // Migrate transactions
    let migratedTransactions = 0;
    for (const transactionData of transactionsData) {
      try {
        // Convert ObjectIds in the data
        const convertedTransactionData = convertObjectId(transactionData);
        
        // Remove _id to let MongoDB generate new ones
        delete convertedTransactionData._id;
        
        // Update sender and receiver IDs - handle both senderId/receiverId and sender/receiver
        let oldSenderId, oldReceiverId;
        
        if (transactionData.senderId) {
          oldSenderId = transactionData.senderId.$oid || transactionData.senderId;
          if (!userIdMapping[oldSenderId]) {
            console.warn(`Warning: Sender ID ${oldSenderId} not found in user mapping, skipping transaction`);
            continue;
          }
          convertedTransactionData.senderId = userIdMapping[oldSenderId];
          delete convertedTransactionData.sender;
        } else if (transactionData.sender) {
          oldSenderId = transactionData.sender.$oid || transactionData.sender;
          if (!userIdMapping[oldSenderId]) {
            console.warn(`Warning: Sender ID ${oldSenderId} not found in user mapping, skipping transaction`);
            continue;
          }
          convertedTransactionData.senderId = userIdMapping[oldSenderId];
        }
        
        if (transactionData.receiverId) {
          oldReceiverId = transactionData.receiverId.$oid || transactionData.receiverId;
          if (!userIdMapping[oldReceiverId]) {
            console.warn(`Warning: Receiver ID ${oldReceiverId} not found in user mapping, skipping transaction`);
            continue;
          }
          convertedTransactionData.receiverId = userIdMapping[oldReceiverId];
          delete convertedTransactionData.receiver;
        } else if (transactionData.receiver) {
          oldReceiverId = transactionData.receiver.$oid || transactionData.receiver;
          if (!userIdMapping[oldReceiverId]) {
            console.warn(`Warning: Receiver ID ${oldReceiverId} not found in user mapping, skipping transaction`);
            continue;
          }
          convertedTransactionData.receiverId = userIdMapping[oldReceiverId];
        }
        
        // Handle category - it's a string in the old format
        if (convertedTransactionData.category && typeof convertedTransactionData.category === 'string') {
          // Keep the category as a string (don't change it)
          // The Transaction model expects category as a string
        }
        
        // Remove fields that don't exist in the actual Transaction model
        delete convertedTransactionData.categoryName;
        delete convertedTransactionData.type;
        delete convertedTransactionData.description;
        delete convertedTransactionData.upiId;
        delete convertedTransactionData.phone;
        delete convertedTransactionData.messages;
        delete convertedTransactionData.__v;
        
        const transaction = new Transaction(convertedTransactionData);
        await transaction.save();
        migratedTransactions++;
        console.log(`Migrated transaction: ${transaction.amount} from ${convertedTransactionData.senderId} to ${convertedTransactionData.receiverId}`);
      } catch (error) {
        console.error(`Error migrating transaction:`, error.message);
        continue; // Skip this transaction and continue with the next one
      }
    }
    
    console.log('Data migration completed successfully!');
    console.log(`Migrated ${migratedUsers.length} users and ${migratedTransactions} transactions`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

migrateData(); 