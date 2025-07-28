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

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://your-actual-frontend-domain.vercel.app', // Replace with your actual Vercel domain
    process.env.FRONTEND_URL // Environment variable for frontend URL
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Define Routes
// Authentications routes handled by user.js
app.use('/api/auth', require('./routes/user'));
// All other core API routes handled by api.js
app.use('/api', require('./routes/api'));

// Simple root route
app.get('/', (req, res) => {
  res.send('PayWise API is running!');
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'PayWise API is healthy' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));