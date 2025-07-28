const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas connection string
const CLOUD_MONGO_URI = 'mongodb+srv://poreddysricharithareddy11:4ehNN0z7muNdWaD9@paywise-cluster.pcuedgz.mongodb.net/test?retryWrites=true&w=majority&appName=paywise-cluster';

// Define schemas
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
    color: { type: String, default: '#007bff' },
    spent: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
    limit: { type: Number, default: 0 }
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

async function checkData() {
  try {
    console.log('Checking data...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(CLOUD_MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    // Get all transactions
    const transactions = await Transaction.find({});
    console.log(`Found ${transactions.length} transactions`);
    
    // Check each user's categories
    for (const user of users) {
      console.log(`\n${user.name} (${user.upiId}):`);
      console.log(`  Balance: ${user.balance}`);
      console.log(`  Categories: ${user.categories.length}`);
      
      for (const category of user.categories) {
        console.log(`    ${category.name}: Spent: ${category.spent}, Received: ${category.received}, Type: ${category.type}`);
      }
    }
    
    // Check a few transactions
    console.log('\nSample transactions:');
    const sampleTransactions = await Transaction.find({}).limit(5).populate('senderId receiverId');
    for (const txn of sampleTransactions) {
      console.log(`  ${txn.amount} from ${txn.senderId.name} to ${txn.receiverId.name} (${txn.category})`);
    }
    
  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

checkData(); 