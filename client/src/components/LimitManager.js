// client/src/components/LimitManager.js
import React, { useState, useEffect } from 'react';
import { getCategories, setCategoryLimit } from '../api';

const LimitManager = ({ userId, onClose, onLimitChange }) => {
  const [categories, setCategories] = useState([]);
  const [limitInputs, setLimitInputs] = useState({}); // Stores input values for each category
  const [message, setMessage] = useState('');

  const fetchCategoriesAndLimits = async () => {
    try {
      const data = await getCategories(userId);
      setCategories(data); // Get all categories, including predefined
      const initialLimitInputs = {};
      data.forEach(cat => {
        initialLimitInputs[cat.name] = cat.limit > 0 ? cat.limit.toString() : ''; // Pre-fill with existing limit or empty
      });
      setLimitInputs(initialLimitInputs);
    } catch (error) {
      setMessage('Error fetching categories and limits 😞');
      console.error('Error fetching categories and limits:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCategoriesAndLimits();
    }
  }, [userId]);

  const handleLimitInputChange = (categoryName, value) => {
    setLimitInputs(prev => ({
      ...prev,
      [categoryName]: value,
    }));
  };

  const handleSetLimit = async (categoryName) => {
    setMessage('');
    const limitValue = limitInputs[categoryName];
    const parsedLimit = parseFloat(limitValue);

    // Allow clearing the input to set limit to 0 (no limit)
    if (limitValue === '') {
      try {
        await setCategoryLimit(userId, categoryName, 0);
        setMessage(`Limit for "${categoryName}" removed. ✅`);
        if (onLimitChange) onLimitChange();
        fetchCategoriesAndLimits(); // Re-fetch to update the displayed limits
      } catch (error) {
        setMessage(error.response?.data?.error || `Error removing limit for ${categoryName} ❌`);
        console.error('Error removing limit:', error);
      }
      return;
    }

    if (isNaN(parsedLimit) || parsedLimit < 0) {
      setMessage('Limit must be a non-negative number.');
      return;
    }

    try {
      await setCategoryLimit(userId, categoryName, parsedLimit);
      setMessage(`Limit for "${categoryName}" set to ₹${parsedLimit.toFixed(2)}. ✅`);
      if (onLimitChange) onLimitChange();
      fetchCategoriesAndLimits(); // Re-fetch to update the displayed limits
    } catch (error) {
      setMessage(error.response?.data?.error || `Error setting limit for ${categoryName} ❌`);
      console.error('Error setting limit:', error);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const predefinedOrder = ['Shopping', 'Groceries', 'Food', 'Rent', 'Other'];
    const aIndex = predefinedOrder.indexOf(a.name);
    const bIndex = predefinedOrder.indexOf(b.name);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (a.type === 'predefined' && b.type === 'custom') return -1;
    if (a.type === 'custom' && b.type === 'predefined') return 1;

    return a.name.localeCompare(b.name);
  });

  const categoryEmojis = {
    'Shopping': '🛍️',
    'Groceries': '🛒',
    'Food': '🍔',
    'Rent': '🏠',
    'Other': '❓',
    'default': '✨'
  };

  return (
    <div style={styles.container}>
      <button onClick={onClose} style={styles.closeButton}>
        Close ✖️
      </button>
      <h3>Set Spending Limits 💰</h3>
      {message && <p style={message.includes('successful') || message.includes('removed') ? styles.successText : styles.errorText}>{message}</p>}

      <ul style={styles.list}>
        {sortedCategories.map((cat) => (
          <li key={cat.name} style={styles.listItem}>
            <div style={styles.categoryInfo}>
              <span style={styles.emoji}>{categoryEmojis[cat.name] || categoryEmojis['default']}</span>
              <strong>{cat.name}</strong>
              {cat.type === 'custom' && <span style={styles.customTag}>(Custom)</span>}
            </div>
            <div style={styles.limitControls}>
              <span style={styles.currentLimit}>
                Current Limit: {cat.limit > 0 ? `₹${cat.limit.toFixed(2)}` : 'No Limit'}
              </span>
              <input
                type="number"
                placeholder="New Limit (0 for no limit)"
                value={limitInputs[cat.name] || ''}
                onChange={(e) => handleLimitInputChange(cat.name, e.target.value)}
                style={styles.limitInput}
                min="0"
              />
              <button
                onClick={() => handleSetLimit(cat.name)}
                style={styles.setLimitButton}
              >
                Set
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p style={styles.note}>
        Enter '0' or clear the input field to remove a spending limit for a category.
      </p>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fdfdfd',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
    position: 'relative',
    marginTop: '20px',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '1.2em',
    cursor: 'pointer',
    color: '#666',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '12px 0',
    borderBottom: '1px solid #f2f2f2',
    gap: '8px',
  },
  categoryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  emoji: {
    fontSize: '1.2em',
  },
  customTag: {
    fontSize: '0.8em',
    color: '#888',
    backgroundColor: '#e9ecef',
    padding: '3px 6px',
    borderRadius: '3px',
    marginLeft: '5px',
  },
  limitControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: '8px 10px',
    borderRadius: '5px',
    border: '1px solid #eee',
  },
  currentLimit: {
    fontWeight: 'bold',
    fontSize: '0.9em',
    color: '#555',
    minWidth: '100px', // Fixed width for alignment
  },
  limitInput: {
    flexGrow: 1,
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9em',
    maxWidth: '150px',
  },
  setLimitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  note: {
    fontSize: '0.85em',
    color: '#666',
    marginTop: '20px',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  successText: {
    color: 'green',
    marginBottom: '10px',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center',
  },
};

export default LimitManager;