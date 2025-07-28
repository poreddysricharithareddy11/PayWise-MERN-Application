const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas connection string
const CLOUD_MONGO_URI = 'mongodb+srv://poreddysricharithareddy11:4ehNN0z7muNdWaD9@paywise-cluster.pcuedgz.mongodb.net/test?retryWrites=true&w=majority&appName=paywise-cluster';

async function fixCategories() {
  try {
    console.log('Starting category fix...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(CLOUD_MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Get the raw database connection
    const db = mongoose.connection.db;
    
    // Get all transactions
    const transactions = await db.collection('transactions').find({}).toArray();
    console.log(`Found ${transactions.length} transactions`);
    
    // Get all users
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users`);
    
    // Create a map of user IDs for easy lookup
    const userMap = {};
    for (const user of users) {
      userMap[user._id.toString()] = user;
    }
    
    // Reset all category spending/receiving amounts to 0
    for (const user of users) {
      for (const category of user.categories) {
        category.spent = 0;
        category.received = 0;
      }
    }
    
    // Process each transaction
    for (const transaction of transactions) {
      const { senderId, receiverId, amount, category } = transaction;
      
      if (!senderId || !receiverId) {
        console.warn(`Skipping transaction ${transaction._id} - missing sender or receiver`);
        continue;
      }
      
      const sender = userMap[senderId.toString()];
      const receiver = userMap[receiverId.toString()];
      
      if (!sender || !receiver) {
        console.warn(`Skipping transaction ${transaction._id} - user not found`);
        continue;
      }
      
      const actualCategoryName = category ? category.trim() : 'Other';
      
      // Update sender's category spending
      let senderCategory = sender.categories.find(cat => cat.name.toLowerCase() === actualCategoryName.toLowerCase());
      if (!senderCategory) {
        senderCategory = {
          name: actualCategoryName,
          spent: 0,
          received: 0,
          type: 'custom',
          limit: 0
        };
        sender.categories.push(senderCategory);
      }
      senderCategory.spent += amount;
      
      // Update receiver's category receiving
      let receiverCategory = receiver.categories.find(cat => cat.name.toLowerCase() === actualCategoryName.toLowerCase());
      if (!receiverCategory) {
        receiverCategory = {
          name: actualCategoryName,
          spent: 0,
          received: 0,
          type: 'custom',
          limit: 0
        };
        receiver.categories.push(receiverCategory);
      }
      receiverCategory.received += amount;
      
      console.log(`Processed transaction: ${amount} from ${sender.name} to ${receiver.name} (${actualCategoryName})`);
    }
    
    // Update all users in the database
    for (const user of users) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { categories: user.categories } }
      );
      console.log(`Updated user: ${user.name}`);
    }
    
    console.log('Category fix completed successfully!');
    
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
    console.error('Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

fixCategories(); 