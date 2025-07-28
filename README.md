# PayWise - Online Money Transaction Application

[![PayWise](https://img.shields.io/badge/PayWise-Online%20Transaction%20App-blue)](https://pay-wise-mern-application.vercel.app/)
[![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)](https://pay-wise-mern-application.vercel.app/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-orange)](https://pay-wise-mern-application.vercel.app/)

## 🌟 Overview

**PayWise** is a comprehensive online money transaction application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides secure and seamless digital payment solutions with advanced financial management features.

## 🚀 Live Demo

**Visit the application:** [https://pay-wise-mern-application.vercel.app/](https://pay-wise-mern-application.vercel.app/)

## ✨ Key Features

### 💳 **Money Transfers**
- **UPI Payments**: Send money instantly using UPI IDs
- **Phone Number Transfers**: Transfer money using phone numbers
- **Secure Transactions**: Password-protected transfers
- **Real-time Processing**: Instant money transfers

### 📊 **Financial Management**
- **Spending Analysis**: Detailed category-wise spending insights
- **Transaction History**: Complete transaction records
- **Interactive Charts**: Visual spending trends and analytics
- **Category Management**: Custom and predefined categories

### 🎯 **Smart Features**
- **Spending Limits**: Set limits for different categories
- **Limit Alerts**: Get notified when approaching spending limits
- **Balance Tracking**: Real-time account balance monitoring
- **User Dashboard**: Comprehensive financial overview

### 🔒 **Security Features**
- **JWT Authentication**: Secure user authentication
- **Password Protection**: Encrypted password storage
- **Session Management**: Secure user sessions
- **Data Privacy**: User data protection

## 🛠️ Technology Stack

### **Frontend**
- **React.js**: Modern UI framework
- **Chart.js**: Interactive data visualization
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

### **Backend**
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling

### **Authentication & Security**
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### **Deployment**
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **MongoDB Atlas**: Cloud database

## 📱 Features in Detail

### **User Registration & Login**
- Secure user registration with validation
- JWT-based authentication
- Password visibility toggle
- User profile management

### **Money Transfer System**
- Send money via UPI ID or phone number
- Password verification for transactions
- Real-time balance updates
- Transaction confirmation

### **Category Management**
- Predefined categories (Shopping, Food, Rent, etc.)
- Custom category creation
- Category-wise spending tracking
- Spending limit management

### **Financial Analytics**
- Monthly spending trends
- Category-wise spending analysis
- Interactive pie charts
- Spending vs receiving comparison

### **Transaction Management**
- Complete transaction history
- Detailed transaction views
- Search and filter transactions
- Export transaction data

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PayWise-MERN-Application.git
   cd PayWise-MERN-Application
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend (.env file in server directory)
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000

   # Frontend (.env file in client directory)
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Run the application**
   ```bash
   # Start backend server
   cd server
   npm start

   # Start frontend (in new terminal)
   cd client
   npm start
   ```

## 📊 Database Schema

### **User Model**
```javascript
{
  name: String,
  phone: String,
  upiId: String,
  password: String,
  balance: Number,
  categories: [{
    name: String,
    spent: Number,
    received: Number,
    type: String,
    limit: Number
  }]
}
```

### **Transaction Model**
```javascript
{
  senderId: ObjectId,
  receiverId: ObjectId,
  amount: Number,
  category: String,
  timestamp: Date,
  messages: [{
    sender: ObjectId,
    message: String,
    timestamp: Date
  }]
}
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Transactions**
- `POST /api/send` - Send money
- `GET /api/transactions/history/:userId` - Get transaction history
- `GET /api/transactions/:id` - Get single transaction

### **User Management**
- `GET /api/balance/:userId` - Get user balance
- `GET /api/categories/:userId` - Get user categories
- `POST /api/categories/:userId` - Add category
- `DELETE /api/categories/:userId/:categoryName` - Delete category

### **Analytics**
- `GET /api/analysis/:userId` - Get spending analysis
- `GET /api/analytics/:userId/monthly-spending` - Get monthly spending data

## 🌐 Deployment

### **Frontend (Vercel)**
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### **Backend (Render)**
1. Connect GitHub repository to Render
2. Set environment variables
3. Configure build settings

### **Database (MongoDB Atlas)**
1. Create MongoDB Atlas cluster
2. Configure network access
3. Set up database users

## 📈 Performance Features

- **Responsive Design**: Works on all devices
- **Fast Loading**: Optimized for performance
- **Real-time Updates**: Live data synchronization
- **Offline Support**: Basic offline functionality

## 🔐 Security Measures

- **HTTPS**: Secure data transmission
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **Rate Limiting**: API request limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@paywise.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/PayWise-MERN-Application/issues)

## 🙏 Acknowledgments

- React.js community
- MongoDB Atlas for database hosting
- Vercel for frontend hosting
- Render for backend hosting

---

**PayWise** - Making digital payments simple, secure, and smart! 💳✨

*Built with ❤️ using the MERN stack*
