const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas connection string
const CLOUD_MONGO_URI = 'mongodb+srv://poreddysricharithareddy11:4ehNN0z7muNdWaD9@paywise-cluster.pcuedgz.mongodb.net/test?retryWrites=true&w=majority&appName=paywise-cluster';

// Define schemas to match the actual models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  upiId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  categories: [
    {
      name: { type: String, required: true },
      spent: { type: Number, default: 0 },
      received: { type: Number, default: 0 },
      type: { type: String, enum: ['predefined', 'custom'], default: 'custom' },
      limit: { type: Number, default: 0 },
    },
  ],
});

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

// Predefined categories
const PREDEFINED_CATEGORIES = ['Shopping', 'Groceries', 'Food', 'Rent', 'Other'];

// Helper function to find or create category
const findOrCreateCategory = (user, categoryName, isPredefined) => {
  let category = user.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    category = {
      name: categoryName,
      spent: 0,
      received: 0,
      type: isPredefined ? 'predefined' : 'custom',
      limit: 0
    };
    user.categories.push(category);
  }
  return category;
};

async function recalculateCategories() {
  try {
    console.log('Starting category recalculation...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(CLOUD_MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Get all transactions
    const transactions = await Transaction.find({}).populate('senderId receiverId');
    console.log(`Found ${transactions.length} transactions to process`);
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    // Reset all category spending/receiving amounts to 0
    for (const user of users) {
      for (const category of user.categories) {
        category.spent = 0;
        category.received = 0;
      }
      user.markModified('categories');
    }
    
    // Process each transaction
    for (const transaction of transactions) {
      const { senderId, receiverId, amount, category } = transaction;
      
      if (!senderId || !receiverId) {
        console.warn(`Skipping transaction ${transaction._id} - missing sender or receiver`);
        continue;
      }
      
      const actualCategoryName = category ? category.trim() : 'Other';
      const isCategoryPredefined = PREDEFINED_CATEGORIES.includes(actualCategoryName);
      
      // Update sender's category spending
      const senderCategory = findOrCreateCategory(senderId, actualCategoryName, isCategoryPredefined);
      senderCategory.spent += amount;
      senderId.markModified('categories');
      
      // Update receiver's category receiving
      const receiverCategory = findOrCreateCategory(receiverId, actualCategoryName, isCategoryPredefined);
      receiverCategory.received += amount;
      receiverId.markModified('categories');
      
      console.log(`Processed transaction: ${amount} from ${senderId.name} to ${receiverId.name} (${actualCategoryName})`);
    }
    
    // Save all users
    for (const user of users) {
      await user.save();
      console.log(`Updated user: ${user.name} - Categories: ${user.categories.length}`);
    }
    
    console.log('Category recalculation completed successfully!');
    
    // Print summary
    for (const user of users) {
      console.log(`\n${user.name} (${user.upiId}):`);
      for (const category of user.categories) {
        if (category.spent > 0 || category.received > 0) {
          console.log(`  ${category.name}: Spent: ${category.spent}, Received: ${category.received}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Recalculation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

recalculateCategories();