import React, { useState, useEffect, useCallback } from 'react';
import { sendMoney, getCategories } from '../api';

const categoryEmojis = {
  'Shopping': '🛍️',
  'Groceries': '🛒',
  'Food': '🍔',
  'Rent': '🏠',
  'Other': '❓',
  'default': '✨',
};

const LimitExceededWarningModal = ({ details, onConfirm, onCancel }) => {
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001,
    },
    modal: {
      backgroundColor: '#fff',
      padding: '35px',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
      maxWidth: '450px',
      width: '90%',
      textAlign: 'center',
      border: '2px solid #dc3545',
      animation: 'fadeInScale 0.3s ease-out forwards',
    },
    title: {
      color: '#dc3545',
      marginBottom: '20px',
      fontSize: '1.8em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    },
    warningIcon: {
      fontSize: '1.5em',
    },
    message: {
      fontSize: '1.1em',
      marginBottom: '15px',
      color: '#333',
    },
    detail: {
      backgroundColor: '#fefefe',
      border: '1px solid #f8d7da',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      textAlign: 'left',
      fontSize: '0.95em',
      lineHeight: '1.6',
    },
    detailItem: {
      marginBottom: '5px',
      color: '#555',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      gap: '15px',
      marginTop: '20px',
    },
    button: {
      padding: '12px 25px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1em',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.1s ease',
      flex: 1,
    },
    confirmButton: {
      backgroundColor: '#28a745',
      color: 'white',
      '&:hover': {
        backgroundColor: '#218838',
        transform: 'translateY(-1px)',
      },
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      '&:hover': {
        backgroundColor: '#5a6268',
        transform: 'translateY(-1px)',
      },
    },
    '@keyframes fadeInScale': {
      '0%': { opacity: 0, transform: 'scale(0.9)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
  };

  return (
    <div style={modalStyles.overlay} onClick={onCancel}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={modalStyles.title}>
          <span style={modalStyles.warningIcon}>⚠️</span> Limit Exceeded!
        </h3>
        <p style={modalStyles.message}>
          You are about to exceed the spending limit on **{details.categoryName}**.
        </p>
        <div style={modalStyles.detail}>
          <p style={modalStyles.detailItem}><strong>Limit:</strong> ₹{details.limit.toFixed(2)}</p>
          <p style={modalStyles.detailItem}><strong>Your spending net till now:</strong> ₹{details.spentTillNow.toFixed(2)}</p>
          <p style={modalStyles.detailItem}><strong>Your current spending:</strong> ₹{details.currentAmount.toFixed(2)}</p>
          <p style={modalStyles.detailItem}><strong>Projected Total:</strong> ₹{(details.spentTillNow + details.currentAmount).toFixed(2)}</p>
        </div>
        <p style={modalStyles.message}>
          Do you wish to proceed with this transaction?
        </p>
        <div style={modalStyles.buttonContainer}>
          <button style={{ ...modalStyles.button, ...modalStyles.confirmButton }} onClick={onConfirm}>
            Continue Anyway
          </button>
          <button style={{ ...modalStyles.button, ...modalStyles.cancelButton }} onClick={onCancel}>
            Cancel Transaction
          </button>
        </div>
      </div>
    </div>
  );
};


const SendMoneyForm = ({ senderId, onTransactionSuccess, userBalance }) => {
  const [receiverIdentifier, setReceiverIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLimitWarningModal, setShowLimitWarningModal] = useState(false);
  const [limitWarningDetails, setLimitWarningDetails] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (senderId) {
      try {
        const allCategories = await getCategories(senderId);
        const sortedCategories = [...allCategories].sort((a, b) => {
          const predefinedOrder = ['Shopping', 'Groceries', 'Food', 'Rent', 'Other'];
          const aIndex = predefinedOrder.indexOf(a.name);
          const bIndex = predefinedOrder.indexOf(b.name);

          // Corrected typo from bBindex to bIndex
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const executeTransaction = async (data) => {
    try {
      const transactionResult = await sendMoney(data);
      console.log("SendMoneyForm API Response (parsed):", transactionResult);

      if (transactionResult.exceedsLimit) {
        setLimitWarningDetails({
          categoryName: transactionResult.exceededCategory,
          limit: transactionResult.limitSet,
          spentTillNow: transactionResult.spentOnCategory,
          currentAmount: data.amount,
        });
        setShowLimitWarningModal(true);
      } else {
        setMessage('Money transferred successfully! ✅');
        setIsSuccess(true);
        onTransactionSuccess(); // Refresh dashboard data
        setReceiverIdentifier('');
        setAmount('');
        setPassword('');
        setSelectedCategory('Other');
      }

    } catch (error) {
      console.error('Transfer error:', error.response?.data?.error || error.message);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      setMessage(errorMessage + ' ❌');
      setIsSuccess(false);
      setShowLimitWarningModal(false); // Ensure modal is hidden on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setShowLimitWarningModal(false); // Hide modal if it was open from previous attempt

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

    // If a warning modal is about to be shown, we let executeTransaction handle it.
    // Otherwise, we directly proceed.
    await executeTransaction(transactionData);
  };

  const handleWarningConfirm = async () => {
    setShowLimitWarningModal(false); // Hide the modal first
    const transactionData = { // Reconstruct data for final execution after user confirmation
      senderId,
      receiverIdentifier,
      amount: parseFloat(amount),
      password,
      category: selectedCategory,
      // Add a flag to indicate that limit warning was acknowledged
      // This flag can be checked on the backend if specific logic is needed after bypass
      limitAcknowledged: true,
    };

    try {
        const transactionResult = await sendMoney(transactionData);
        setMessage(`Transaction successful, but you've exceeded your spending limit for "${transactionResult.exceededCategory}"! ⚠️`);
        setIsSuccess(true);
        onTransactionSuccess(); // Refresh dashboard data
        setReceiverIdentifier('');
        setAmount('');
        setPassword('');
        setSelectedCategory('Other');
    } catch (error) {
        console.error('Transfer error after confirmation:', error.response?.data?.error || error.message);
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        setMessage(errorMessage + ' ❌');
        setIsSuccess(false);
    }
  };

  const handleWarningCancel = () => {
    setShowLimitWarningModal(false);
    setMessage('Transaction cancelled by user. 🚫');
    setIsSuccess(false);
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
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={styles.select}
          >
            {availableCategories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {categoryEmojis[cat.name] || categoryEmojis['default']} {cat.name}
              </option>
            ))}
          </select>
          <p style={styles.note}>
            Want to add a new category? Go to "Manage Categories".
          </p>
        </div>

        <input
          type="password"
          placeholder="Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Send Money</button>
      </form>
      {message && <p style={isSuccess ? styles.successText : styles.errorText}>{message}</p>}

      {showLimitWarningModal && limitWarningDetails && (
        <LimitExceededWarningModal
          details={limitWarningDetails}
          onConfirm={handleWarningConfirm}
          onCancel={handleWarningCancel}
        />
      )}
    </div>
  );
};

export default SendMoneyForm;
