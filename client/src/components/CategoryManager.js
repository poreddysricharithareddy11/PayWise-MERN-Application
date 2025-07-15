import React, { useState, useEffect, useCallback } from 'react';
import { getCategories, addCategory, deleteCategory } from '../api';

const CategoryManager = ({ userId, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories(userId);
      setCategories(data);
    } catch (error) {
      setMessage('Error fetching categories 😞');
      setIsSuccess(false);
      console.error('Error fetching categories:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId, fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    const trimmedCategoryName = newCategoryName.trim();
    if (!trimmedCategoryName) {
      setMessage('Category name cannot be empty.');
      return;
    }
    try {
      const updatedCategories = await addCategory(userId, { categoryName: trimmedCategoryName });
      setCategories(updatedCategories);
      setNewCategoryName('');
      setMessage('Category added successfully! ✅');
      setIsSuccess(true);
      onClose(); // Call onClose to refresh parent dashboard data
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error adding category ❌');
      setIsSuccess(false);
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    setMessage('');
    setIsSuccess(false);
    // Using a custom modal for confirmation is better than window.confirm in React apps
    // For now, keeping window.confirm as per previous code, but consider replacing it.
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone and will affect past analysis data.`)) {
      return;
    }

    try {
      const updatedCategories = await deleteCategory(userId, categoryName);
      setCategories(updatedCategories);
      setMessage('Category deleted successfully! 🗑️');
      setIsSuccess(true);
      onClose(); // Call onClose to refresh parent dashboard data
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error deleting category ❌');
      setIsSuccess(false);
      console.error('Error deleting category:', error);
    }
  };

  const deletableCategories = categories.filter(cat => cat.type === 'custom');

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
    addForm: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      alignItems: 'center',
    },
    input: {
      flexGrow: 1,
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1em',
    },
    addButton: {
      padding: '10px 15px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: 'bold',
    },
    categoryList: {
      marginTop: '20px',
    },
    list: {
      listStyleType: 'none',
      padding: 0,
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '1px solid #eee',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      marginBottom: '5px',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '5px 10px',
      cursor: 'pointer',
      fontSize: '0.8em',
    },
    message: {
      marginTop: '10px',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    successMessage: {
      color: '#28a745',
    },
    errorMessage: {
      color: '#dc3545',
    },
    note: {
      fontSize: '0.85em',
      color: '#666',
      marginTop: '20px',
      textAlign: 'center',
      fontStyle: 'italic',
    },
  };

  return (
    // Add onClick to the container to close when clicking outside the inner modal content
    // And e.stopPropagation() to the inner content to prevent closing when clicking inside
    <div style={styles.container} onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} style={styles.closeButton}>
        Close ✖️
      </button>
      <h3>Manage Your Custom Categories ✨</h3>
      {message && (
        <p style={isSuccess ? { ...styles.message, ...styles.successMessage } : { ...styles.message, ...styles.errorMessage }}>
          {message}
        </p>
      )}

      <form onSubmit={handleAddCategory} style={styles.addForm}>
        <input
          type="text"
          placeholder="Add New Custom Category"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.addButton}>Add Category ➕</button>
      </form>

      <div style={styles.categoryList}>
        <h4>Your Custom Categories:</h4>
        {deletableCategories.length === 0 ? (
          <p>No custom categories added yet. Add one above!</p>
        ) : (
          <ul style={styles.list}>
            {deletableCategories.map((cat) => (
              <li key={cat.name} style={styles.listItem}>
                <span>{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.name)}
                  style={styles.deleteButton}
                >
                  Delete 🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
        <p style={styles.note}>
          Predefined categories (Shopping, Groceries, Food, Rent, Other) cannot be deleted.
          You can set spending limits for all categories in the Spending Analysis section.
        </p>
      </div>
    </div>
  );
};

export default CategoryManager;