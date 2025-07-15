// server/routes/api.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is used for password hashing
const jwt = require('jsonwebtoken'); // Assuming jsonwebtoken is used for authentication
const mongoose = require('mongoose');

// Predefined categories that are always available and cannot be deleted
const PREDEFINED_CATEGORIES = ['Shopping', 'Groceries', 'Food', 'Rent', 'Other'];

// --- Helper function to find or create category in a user's categories array ---
// This function ensures that if a category doesn't exist for a user, it's added
// with default values. It also handles setting the 'type' correctly.
const findOrCreateCategory = (user, categoryName, isPredefined) => {
  let category = user.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    // If category doesn't exist, create it.
    // New categories (custom or predefined upon first use) start with 0 spent/received and 0 limit.
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

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/auth/register', async (req, res) => {
  console.log('Backend /auth/register - Received req.body:', req.body); // Debugging log

  const { name, upiId, phoneNumber, password } = req.body;

  try {
    // Basic validation
    if (!name || !upiId || !phoneNumber || !password) {
      return res.status(400).json({ msg: 'Please enter all fields for registration.' });
    }

    // Check if user already exists by UPI ID or Phone Number
    let existingUser = await User.findOne({ $or: [{ upiId }, { phone: phoneNumber }] });

    if (existingUser) {
      if (existingUser.upiId === upiId) {
        return res.status(400).json({ msg: 'User with this UPI ID already exists.' });
      }
      if (existingUser.phone === phoneNumber) {
        return res.status(400).json({ msg: 'User with this Phone Number already exists.' });
      }
      return res.status(400).json({ msg: 'User with this UPI ID or Phone Number already exists.' });
    }

    // Create new user instance. Password will be hashed by the pre-save hook in User model.
    const newUser = new User({
      name,
      upiId,
      phone: phoneNumber, // Map frontend's phoneNumber to backend's 'phone' field
      password,
    });

    await newUser.save(); // This triggers the pre-save hook for password hashing and category initialization

    // Generate JWT
    const payload = {
      user: {
        id: newUser.id,
        name: newUser.name,
        upiId: newUser.upiId,
        phoneNumber: newUser.phone,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            userId: newUser.id,
            name: newUser.name,
            upiId: newUser.upiId,
            phoneNumber: newUser.phone,
          },
          msg: 'Registration successful!',
        });
      }
    );
  } catch (err) {
    console.error('Server error during registration:', err.message);
    res.status(500).send('Server error during registration.');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/auth/login', async (req, res) => {
  console.log('Backend /auth/login - Received req.body:', req.body); // Debugging log

  const { upiId, password } = req.body;

  try {
    if (!upiId || !password) {
      return res.status(400).json({ msg: 'Please enter both UPI ID and password.' });
    }

    const user = await User.findOne({ upiId });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials. User not found.' });
    }

    // Compare entered password with hashed password from DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials. Incorrect password.' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        upiId: user.upiId,
        phoneNumber: user.phone, // Ensure 'phone' is used here to match model
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            userId: user.id,
            name: user.name,
            upiId: user.upiId,
            phoneNumber: user.phone,
          },
          msg: 'Login successful!',
        });
      }
    );
  } catch (err) {
    console.error('Server error during login:', err.message);
    res.status(500).send('Server error during login.');
  }
});


// @route GET /api/balance/:id
// @desc Get user balance and categories
// @access Private (via auth middleware)
router.get('/balance/:id', auth, async (req, res) => {
  try {
    // Ensure the authenticated user matches the requested user ID
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Not authorized to view this balance.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return both balance and the user's categories array
    res.json({ balance: user.balance, categories: user.categories });
  } catch (err) {
    console.error('Server error fetching balance or categories:', err);
    res.status(500).json({ error: 'Server error fetching balance or categories.' });
  }
});

// @route POST /api/send
// @desc Transfer money between users with limit check
// @access Private (via auth middleware)
router.post('/send', auth, async (req, res) => {
  const { senderId, receiverIdentifier, amount, password, category } = req.body;

  try {
    // Authorization check: Ensure the senderId in the request body matches the authenticated user's ID
    if (req.user.id !== senderId) {
      return res.status(403).json({ msg: 'Not authorized to perform this transfer.' });
    }

    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });

    // Password verification
    const isPasswordMatch = await sender.matchPassword(password);
    if (!isPasswordMatch) return res.status(403).json({ error: 'Incorrect password' });

    // Find receiver by UPI ID or Phone Number
    let receiver;
    if (receiverIdentifier.includes('@')) {
      receiver = await User.findOne({ upiId: receiverIdentifier });
    } else {
      receiver = await User.findOne({ phone: receiverIdentifier });
    }

    if (!receiver) return res.status(404).json({ error: 'Receiver not found.' });
    if (sender.balance < amount) return res.status(400).json({ error: 'Insufficient funds.' });
    if (sender._id.equals(receiver._id)) return res.status(400).json({ error: 'Cannot send money to yourself.' });
    if (amount <= 0) return res.status(400).json({ error: 'Transfer amount must be positive.' });


    const actualCategoryName = category ? category.trim() : 'Other';
    const isCategoryPredefined = PREDEFINED_CATEGORIES.includes(actualCategoryName);

    let exceedsLimit = false;
    let exceededCategory = '';
    let limitSet = 0; // Initialize to 0
    let spentOnCategory = 0; // Initialize to 0

    // Find the sender's category for limit check
    const senderCategoryForLimitCheck = sender.categories.find(
      cat => cat.name.toLowerCase() === actualCategoryName.toLowerCase()
    );

    if (senderCategoryForLimitCheck) {
      spentOnCategory = senderCategoryForLimitCheck.spent; // Get current spent
      limitSet = senderCategoryForLimitCheck.limit; // Get current limit
      if (limitSet > 0) { // Only check if a limit is set
        const projectedSpent = spentOnCategory + amount;
        if (projectedSpent > limitSet) {
          exceedsLimit = true;
          exceededCategory = actualCategoryName;
        }
      }
    }

    // --- DEBUGGING LOGS FOR BACKEND ---
    console.log(`--- Limit Check for ${actualCategoryName} ---`);
    console.log(`Amount to send: ${amount}`);
    console.log(`Current spent on category: ${spentOnCategory}`);
    console.log(`Limit set for category: ${limitSet}`);
    console.log(`Projected total spent: ${spentOnCategory + amount}`);
    console.log(`Exceeds limit? ${exceedsLimit}`);
    console.log(`-----------------------------------`);
    // --- END DEBUGGING LOGS ---


    // Perform the money transfer
    sender.balance -= amount;
    receiver.balance += amount;

    // Update sender's category spending
    const senderCategory = findOrCreateCategory(sender, actualCategoryName, isCategoryPredefined);
    senderCategory.spent += amount;
    sender.markModified('categories'); // Mark categories array as modified for Mongoose to save changes

    // Update receiver's category receiving
    const receiverCategory = findOrCreateCategory(receiver, actualCategoryName, isCategoryPredefined);
    receiverCategory.received += amount;
    receiver.markModified('categories'); // Mark categories array as modified

    // Save updated user documents
    await sender.save();
    await receiver.save();

    // Create transaction record
    const transaction = await Transaction.create({
      senderId: sender._id,
      receiverId: receiver._id,
      amount,
      category: actualCategoryName,
      timestamp: new Date()
    });

    // Send response including limit check details
    res.json({
      message: 'Transaction successful',
      transaction,
      exceedsLimit,
      exceededCategory,
      limitSet,      // Return the limit that was set for the category
      spentOnCategory // Return the amount spent on the category BEFORE this transaction
    });
  } catch (err) {
    console.error('Transaction failed:', err);
    // Provide a more specific error message if it's a known error type
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Transaction failed due to server error.' });
  }
});

// @route GET /api/transactions/history/:userId
// @desc Get all transactions (sent and received) for a specific user
// @access Private (via auth middleware)
router.get('/transactions/history/:userId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Not authorized to view these transactions.' });
    }

    const transactions = await Transaction.find({
      $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }],
    })
      .populate('senderId', 'name upiId')
      .populate('receiverId', 'name upiId')
      .sort({ timestamp: -1 });

    res.json(transactions);
  } catch (err) {
    console.error('Server error fetching transaction history:', err);
    res.status(500).json({ error: 'Error fetching history' });
  }
});

// @route POST /api/transactions/message/:id
// @desc Add a message to a transaction
// @access Private (via auth middleware)
router.post('/transactions/message/:id', auth, async (req, res) => {
  const { senderId, message } = req.body;
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    if (req.user.id !== senderId || (!txn.senderId.equals(senderId) && !txn.receiverId.equals(senderId))) {
      return res.status(403).json({ msg: 'Not authorized to send message for this transaction.' });
    }

    txn.messages.push({ sender: senderId, message, timestamp: new Date() });
    await txn.save();

    const populated = await Transaction.findById(req.params.id)
      .populate('messages.sender', 'name upiId');

    res.json(populated);
  } catch (err) {
    console.error('Server error adding message to transaction:', err);
    res.status(500).json({ error: 'Could not send message' });
  }
});

// @route GET /api/transactions/:id
// @desc Get details of a single transaction
// @access Private (via auth middleware)
router.get('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('senderId', 'name upiId')
      .populate('receiverId', 'name upiId')
      .populate('messages.sender', 'name upiId');
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    // Ensure the authenticated user is either the sender or receiver of the transaction
    if (req.user.id !== transaction.senderId._id.toString() && req.user.id !== transaction.receiverId._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this transaction.' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Server error fetching single transaction:', err);
    res.status(500).json({ error: 'Error fetching transaction' });
  }
});

// @route GET /api/categories/:userId
// @desc Get user's custom and default categories with limits
// @access Private
router.get('/categories/:userId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Not authorized to access these categories.' });
    }

    const user = await User.findById(req.params.userId).select('categories');
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }
    res.json(user.categories);

  } catch (err) {
    console.error('Server Error fetching categories:', err.message);
    res.status(500).json({ msg: 'Server Error fetching categories.' });
  }
});

// @route POST /api/categories/:userId
// @desc Add a new custom category for the user
// @access Private
router.post('/categories/:userId', auth, async (req, res) => { // Path changed to just /:userId
  const { categoryName } = req.body;

  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Not authorized to add categories for this user.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    const trimmedCategoryName = categoryName.trim();
    if (!trimmedCategoryName) {
      return res.status(400).json({ msg: 'Category name cannot be empty.' });
    }

    const existingCategory = user.categories.find(
      cat => cat.name.toLowerCase() === trimmedCategoryName.toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({ msg: 'Category with this name already exists for you.' });
    }

    user.categories.push({ name: trimmedCategoryName, spent: 0, received: 0, type: 'custom', limit: 0 });
    user.markModified('categories');
    await user.save();

    res.status(201).json(user.categories);
  } catch (err) {
    console.error('Server Error adding category:', err.message);
    res.status(500).json({ msg: 'Server Error adding category.' });
  }
});

// @route DELETE /api/categories/:userId/:categoryName
// @desc Delete a custom category for the user
// @access Private
router.delete('/categories/:userId/:categoryName', auth, async (req, res) => { // Path changed to just /:categoryName
  const { categoryName } = req.params;

  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Not authorized to delete categories for this user.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Prevent deletion of predefined categories
    if (PREDEFINED_CATEGORIES.map(name => name.toLowerCase()).includes(categoryName.toLowerCase())) {
      return res.status(400).json({ msg: 'Cannot delete predefined categories.' });
    }

    const initialLength = user.categories.length;
    user.categories = user.categories.filter(
      (cat) => cat.name.toLowerCase() !== categoryName.toLowerCase()
    );

    if (user.categories.length === initialLength) {
      return res.status(404).json({ msg: 'Category not found or is a predefined category and cannot be deleted.' });
    }

    user.markModified('categories');
    await user.save();

    res.json(user.categories);
  } catch (err) {
    console.error('Server Error deleting category:', err.message);
    res.status(500).json({ msg: 'Server Error deleting category.' });
  }
});

// @route PUT /api/categories/:userId/:categoryName/set-limit
// @desc Set/Update spending limit for a specific category
// @access Private
router.put('/categories/:userId/:categoryName/set-limit', auth, async (req, res) => { // Path adjusted for clarity
  const { categoryName } = req.params;
  const { limit } = req.body;

  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Not authorized to set limits for this user.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    const categoryToUpdate = user.categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!categoryToUpdate) {
      return res.status(404).json({ msg: 'Category not found for this user.' });
    }

    const newLimit = parseFloat(limit);
    if (isNaN(newLimit) || newLimit < 0) {
      return res.status(400).json({ msg: 'Limit must be a non-negative number.' });
    }

    categoryToUpdate.limit = newLimit;
    user.markModified('categories');
    await user.save();

    res.json(user.categories); // Respond with updated categories
  } catch (err) {
    console.error('Server Error setting category limit:', err.message);
    res.status(500).json({ msg: 'Server Error setting category limit.' });
  }
});


// @route GET /api/analysis/:userId
// @desc Get spending and receiving data by category for a user
// @access Private
router.get('/analysis/:userId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Not authorized to access this analysis.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Filter categories to include only those with activity or predefined with a limit
    const analysis = user.categories
      .filter(cat => cat.spent > 0 || cat.received > 0 || (PREDEFINED_CATEGORIES.includes(cat.name) && cat.limit > 0))
      .map(cat => ({
        name: cat.name,
        spent: cat.spent,
        received: cat.received,
        type: cat.type,
        limit: cat.limit,
      }));

    res.json(analysis);
  } catch (err) {
    console.error('Server error fetching analysis:', err);
    res.status(500).json({ error: 'Error fetching analysis' });
  }
});

// @route GET /api/analytics/:userId/monthly-spending
// @desc Get monthly spending data by category for charts including limits
// @access Private (requires authentication)
router.get('/analytics/:userId/monthly-spending', auth, async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ msg: 'Not authorized to access this data.' });
        }

        const userId = new mongoose.Types.ObjectId(req.params.userId);

        const pipeline = [
            {
                $match: {
                    senderId: userId, // Only consider money sent by the user for spending analysis
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$timestamp' },
                        month: { $month: '$timestamp' },
                        category: '$category',
                    },
                    totalSpent: { $sum: '$amount' },
                },
            },
            {
                $group: {
                    _id: {
                        year: '$_id.year',
                        month: '$_id.month',
                    },
                    monthlyTotal: { $sum: '$totalSpent' },
                    categories: {
                        $push: {
                            category: '$_id.category',
                            amount: '$totalSpent',
                        },
                    },
                },
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: 1,
                    monthlyTotal: 1,
                    categories: 1,
                },
            },
        ];

        const spendingData = await Transaction.aggregate(pipeline);

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const formattedSpendingData = spendingData.map(data => {
            return {
                ...data,
                monthName: monthNames[data.month - 1],
            };
        });

        res.json(formattedSpendingData);
    } catch (err) {
        console.error('Server error during analytics data fetching:', err.message);
        res.status(500).json({ msg: 'Server Error fetching analytics data.' });
    }
});


module.exports = router;
