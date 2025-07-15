const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Import bcryptjs
require('dotenv').config({ path: '../.env' }); // Load .env from the server directory

// Connect to MongoDB using the URI from .env
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/phonepe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding...'))
.catch(err => {
  console.error('MongoDB connection error during seeding:', err.message);
  process.exit(1);
});

const usersToSeed = [
  {
    name: 'Alice Smith',
    phone: '9999999999',
    upiId: 'alice@upi',
    password: '1234', // This will be hashed by the User model's pre-save hook
    balance: 50000,
  },
  {
    name: 'Bob Johnson',
    phone: '8888888888',
    upiId: 'bob@upi',
    password: '1234', // This will be hashed by the User model's pre-save hook
    balance: 100000,
  },
  {
    name: 'Charlie Brown',
    phone: '7777777777',
    upiId: 'charlie@upi',
    password: '1234', // This will be hashed by the User model's pre-save hook
    balance: 75000,
  },
  {
    name: 'David Lee',
    phone: '6666666666',
    upiId: 'david@upi',
    password: '1234', // This will be hashed by the User model's pre-save hook
    balance: 95000,
  },
];

async function insertUsers() {
  try {
    console.log('Clearing existing users...');
    await User.deleteMany({}); // Clears all existing user documents
    console.log('Existing users cleared.');

    console.log('Inserting users individually to ensure password hashing...');
    const insertedUsers = [];
    for (const userData of usersToSeed) {
      const user = new User(userData); // Create a new Mongoose document instance
      await user.save(); // Call .save() on each instance to trigger the pre('save') hook
      insertedUsers.push(user);
      console.log(`Inserted user: ${user.name}`);
    }
    console.log('Users inserted successfully!');

  } catch (err) {
    console.error('Error inserting users:', err);
  } finally {
    // Ensure the connection is closed after seeding, regardless of success or failure
    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

// This ensures `insertUsers` is called only after the MongoDB connection is open.
mongoose.connection.once('open', insertUsers);