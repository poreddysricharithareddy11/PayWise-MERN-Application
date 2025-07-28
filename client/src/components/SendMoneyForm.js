import React, { useState, useEffect, useCallback } from 'react';
import { sendMoney, getCategories } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryManager from './CategoryManager';

const categoryEmojis = {
  'Shopping': '🛍️',
  'Groceries': '🛒',
  'Food': '🍔',
  'Rent': '🏠',
  'Other': '❓',
  'default': '✨',
};

const SendMoneyForm = ({ senderId, onTransactionSuccess, userBalance }) => {
  const [receiverIdentifier, setReceiverIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (senderId) {
      try {
        const allCategories = await getCategories(senderId);
        const sortedCategories = [...allCategories].sort((a, b) => {
          const order = ['Shopping', 'Groceries', 'Food', 'Rent', 'Other'];
          const aIndex = order.indexOf(a.name);
          const bIndex = order.indexOf(b.name);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (a.type === 'predefined' && b.type === 'custom') return -1;
          if (a.type === 'custom' && b.type === 'predefined') return 1;
          return a.name.localeCompare(b.name);
        });

        setAvailableCategories(sortedCategories);
        if (!sortedCategories.some(cat => cat.name === selectedCategory)) {
          setSelectedCategory('Other');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setMessage('Error fetching categories.');
      }
    }
  }, [senderId, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!receiverIdentifier || !amount || !password) {
      setMessage('Please fill in all fields.');
      return;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount.');
      return;
    }
    if (parseFloat(amount) > userBalance) {
      setMessage('Insufficient balance.');
      return;
    }

    const transactionData = {
      senderId,
      receiverIdentifier,
      amount: parseFloat(amount),
      password,
      category: selectedCategory,
    };

    try {
      const result = await sendMoney(transactionData);

      if (result.exceedsLimit) {
        toast.warn(`Limit exceeded for ${result.exceededCategory}. Limit ₹${result.limitSet}, you're spending ₹${amount} (already spent ₹${result.spentOnCategory})`, {
          position: 'top-right',
          autoClose: 6000,
          style: {
           fontSize: '1.1rem',
           padding: '20px',
           minHeight: '80px',
           borderRadius: '10px',
  }
        });
      }

      setMessage('Money transferred successfully! ✅');
      setIsSuccess(true);
      onTransactionSuccess();
      setReceiverIdentifier('');
      setAmount('');
      setPassword('');
      setSelectedCategory('Other');
    } catch (error) {
      console.error('Transfer error:', error);
      const errMsg = error.response?.data?.error || error.message || 'Unknown error';
      setMessage(errMsg + ' ❌');
      setIsSuccess(false);
    }
  };

  const styles = {
    container: {
      backgroundColor: '#fff',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      marginBottom: '30px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    input: {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1em',
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1.1em',
      fontWeight: 'bold',
    },
    successText: {
      color: 'green',
      marginTop: '10px',
      textAlign: 'center',
    },
    errorText: {
      color: 'red',
      marginTop: '10px',
      textAlign: 'center',
    },
    categorySelection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '10px',
    },
    label: {
      fontWeight: 'bold',
      color: '#555',
      fontSize: '0.9em',
    },
    select: {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1em',
      backgroundColor: '#f9f9f9',
    },
    note: {
      fontSize: '0.8em',
      color: '#777',
      fontStyle: 'italic',
      marginTop: '5px',
    },
    noteBox: {
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '5px',
      padding: '15px',
      marginTop: '20px',
      textAlign: 'left',
    },
    noteTitle: {
      color: '#856404',
      fontWeight: 'bold',
      marginBottom: '10px',
      fontSize: '1em',
    },
    noteText: {
      color: '#856404',
      fontSize: '0.9em',
      lineHeight: '1.4',
      marginBottom: '8px',
    },
    upiList: {
      color: '#856404',
      fontSize: '0.9em',
      lineHeight: '1.4',
      marginTop: '5px',
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>Send Money 💸</h3>
        <input
          type="text"
          placeholder="Receiver UPI ID or Phone Number"
          value={receiverIdentifier}
          onChange={(e) => setReceiverIdentifier(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
          min="0.01"
          step="0.01"
          required
        />
        <div style={styles.categorySelection}>
          <label htmlFor="category-select" style={styles.label}>Choose Category (Optional):</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ ...styles.select, flex: 2, minWidth: 0 }}
            >
              {availableCategories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {categoryEmojis[cat.name] || categoryEmojis['default']} {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              style={{ padding: '6px 10px', borderRadius: '4px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', flex: 1, minWidth: '120px', maxWidth: '160px', fontSize: '0.95em', whiteSpace: 'nowrap' }}
              onClick={() => setShowCategoryManager(true)}
            >
              Manage Categories
            </button>
          </div>
          <p style={styles.note}>
            Want to add a new category? Click "Manage Categories".
          </p>
        </div>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, paddingRight: '38px' }}
            required
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2em', color: '#888', background: 'white', padding: '0 2px' }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '\ud83d\udc41\ufe0f' : '\ud83d\udc41'}
          </span>
        </div>
        <button type="submit" style={styles.button}>Send Money</button>
      </form>
      
      {/* Note Section */}
      <div style={styles.noteBox}>
        <div style={styles.noteTitle}>📝 Demo Information:</div>
        <div style={styles.noteText}>
          <strong>Default Password:</strong> 1234 (for all users)
        </div>
        <div style={styles.noteText}>
          <strong>Available UPI IDs for testing:</strong>
        </div>
        <div style={styles.upiList}>
          • alice@upi<br/>
          • bob@upi<br/>
          • charlie@upi<br/>
          • david@upi
        </div>
      </div>
      
      {message && <p style={isSuccess ? styles.successText : styles.errorText}>{message}</p>}
      {showCategoryManager && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px 24px', minWidth: '340px', minHeight: '220px', maxWidth: '95vw', maxHeight: '90vh', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <button
              onClick={() => { setShowCategoryManager(false); fetchCategories(); }}
              style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#888' }}
              title="Close"
            >
              ×
            </button>
            <CategoryManager userId={senderId} onClose={() => { setShowCategoryManager(false); fetchCategories(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoneyForm;
