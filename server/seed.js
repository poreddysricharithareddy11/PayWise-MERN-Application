// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Assuming your DB connection path
const User = require('./models/User');    // User Model
const Transaction = require('./models/Transaction'); // Transaction Model

dotenv.config(); // Load environment variables
connectDB();     // Connect to MongoDB

const seedDB = async () => {
    try {
        console.log('--- Starting Database Seeding ---');

        // 1. Clear existing data
        console.log('Clearing existing users and transactions...');
        await User.deleteMany({});
        await Transaction.deleteMany({}); // Clear transactions as well
        console.log('Previous data cleared successfully!');

        // 2. Seed Users
        console.log('Seeding users...');
        const plainTextUsersData = [
            {
                name: 'Alice Smith',
                upiId: 'alice@ybl',
                phoneNumber: '9876543210',
                password: '1234', // This will be hashed by the User model's pre-save hook
                balance: 50000,
            },
            {
                name: 'Bob Johnson',
                upiId: 'bob@sbi',
                phoneNumber: '8765432109',
                password: '1234',
                balance: 25000,
            },
            {
                name: 'Charlie Brown',
                upiId: 'charlie@upi',
                phoneNumber: '7654321098',
                password: '1234',
                balance: 10000,
            },
        ];

        // Map the plainTextUsersData to match the User model schema (phoneNumber -> phone)
        // The User model's pre('save') hook will handle hashing passwords
        // and adding default categories.
        const usersToInsert = plainTextUsersData.map(user => ({
            name: user.name,
            upiId: user.upiId,
            phone: user.phoneNumber, // CRITICAL: Map phoneNumber to 'phone'
            password: user.password,
            balance: user.balance,
        }));

        await User.insertMany(usersToInsert); // Use the mapped array
        console.log('Users seeded successfully!');

        console.log('--- Database Seeding Complete! ---');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding database:', err);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedDB();
