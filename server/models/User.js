const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define default categories that every new user will have
const defaultUserCategories = [
  { name: 'Shopping', spent: 0, received: 0, type: 'predefined', limit: 0 },
  { name: 'Groceries', spent: 0, received: 0, type: 'predefined', limit: 0 },
  { name: 'Food', spent: 0, received: 0, type: 'predefined', limit: 0 },
  { name: 'Rent', spent: 0, received: 0, type: 'predefined', limit: 0 },
  { name: 'Other', spent: 0, received: 0, type: 'predefined', limit: 0 },
];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  upiId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  // Each user will have their own array of categories
  categories: [
    {
      name: { type: String, required: true },
      spent: { type: Number, default: 0 }, // Amount spent in this category
      received: { type: Number, default: 0 }, // Amount received in this category
      type: { type: String, enum: ['predefined', 'custom'], default: 'custom' }, // 'predefined' or 'custom'
      limit: { type: Number, default: 0 }, // Spending limit for this category (0 means no limit)
    },
  ],
});

// Pre-save hook to hash password before saving user and initialize categories
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Initialize default categories only if it's a new user and categories array is empty
  // This ensures predefined categories are added only once when the user is created
  if (this.isNew && this.categories.length === 0) {
    this.categories = [...defaultUserCategories];
  }

  next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);