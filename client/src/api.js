import axios from 'axios';

// Use environment variable for API URL in production, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token for all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User Authentication
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data; // This returns the actual data payload (token, user, msg)
  } catch (error) {
    throw error; // Re-throw to be caught by the component
  }
};

// User Data & Balances
export const getBalance = async (userId) => {
  const response = await api.get(`/balance/${userId}`);
  return response.data;
};

export const getTransactions = async (userId) => {
  const response = await api.get(`/transactions/history/${userId}`);
  return response.data;
};

// Get a single transaction by its ID
export const getSingleTransaction = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
};

export const getAnalysis = async (userId) => {
  const response = await api.get(`/analysis/${userId}`);
  return response.data;
};

// Send Money
export const sendMoney = async (transactionData) => {
  const response = await api.post('/send', transactionData);
  return response.data;
};

// Categories
export const getCategories = async (userId) => {
  const response = await api.get(`/categories/${userId}`);
  return response.data;
};

export const addCategory = async (userId, categoryData) => {
  const response = await api.post(`/categories/${userId}`, categoryData);
  return response.data;
};

export const deleteCategory = async (userId, categoryName) => {
  const response = await api.delete(`/categories/${userId}/${categoryName}`);
  return response.data;
};

export const setCategoryLimit = async (userId, categoryName, limitAmount) => {
  const response = await api.put(`/categories/${userId}/${categoryName}/set-limit`, {
    limit: limitAmount,
  });
  return response.data;
};

// Analytics (for charts)
export const getMonthlySpendingAnalytics = async (userId) => {
  const response = await api.get(`/analytics/${userId}/monthly-spending`);
  return response.data;
};

export default api;
