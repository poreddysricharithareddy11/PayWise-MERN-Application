const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Ensure auth middleware is imported

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, upiId, phoneNumber, password } = req.body;

  try {
    // Basic validation
    if (!name || !upiId || !phoneNumber || !password) {
      return res.status(400).json({ msg: 'Please enter all fields for registration.' });
    }

    // Check if user already exists by UPI ID or Phone Number
    let existingUser = await User.findOne({ $or: [{ upiId }, { phoneNumber }] });

    if (existingUser) {
      if (existingUser.upiId === upiId) {
        return res.status(400).json({ msg: 'User with this UPI ID already exists.' });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(400).json({ msg: 'User with this Phone Number already exists.' });
      }
      return res.status(400).json({ msg: 'User with this UPI ID or Phone Number already exists.' });
    }

    // Create new user instance. Password will be hashed by the pre-save hook in User model.
    const user = new User({
      name,
      upiId,
      phoneNumber,
      password,
      balance: 0, // Initialize balance to 0 for new users
    });

    await user.save();

    // Generate JWT (optional, can be done on separate login)
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ msg: 'Registration successful!', token, user: { userId: user.id, name: user.name, upiId: user.upiId, phoneNumber: user.phoneNumber } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration.');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // Can be UPI ID or Phone Number

  try {
    // Input validation: Ensure identifier and password are provided
    if (!identifier || !password) {
      return res.status(400).json({ msg: 'Please enter both UPI ID/Phone Number and password.' });
    }

    // Find user by UPI ID or Phone Number
    let user;
    // Check if identifier looks like a UPI ID (contains '@')
    if (identifier.includes('@')) {
      user = await User.findOne({ upiId: identifier });
    } else {
      user = await User.findOne({ phoneNumber: identifier });
    }

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials. User not found.' });
    }

    // Check password using the method defined in the User model
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
        phoneNumber: user.phoneNumber,
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
            phoneNumber: user.phoneNumber,
          },
          msg: 'Login successful!',
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login.');
  }
});

// @route   GET /api/auth
// @desc    Get logged in user details (useful for re-authenticating on page refresh)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Select user data but exclude the password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;