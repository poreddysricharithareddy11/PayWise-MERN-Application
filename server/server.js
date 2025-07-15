const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/phonepe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected to phonepe database successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS

// Define Routes
// Authentications routes handled by user.js
app.use('/api/auth', require('./routes/user'));
// All other core API routes handled by api.js
app.use('/api', require('./routes/api'));


// Simple root route
app.get('/', (req, res) => {
  res.send('PhonePe Clone API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));