import React, { useState, useEffect, useCallback } from 'react';
// Removed getCategories from this import list
import { getBalance, getTransactions, getAnalysis } from '../api'; // Corrected import
import SendMoneyForm from './SendMoneyForm';
import TransactionHistory from './TransactionHistory';
import SpendingAnalysis from './SpendingAnalysis';
import CategoryManager from './CategoryManager';

const Dashboard = ({ user, handleLogout }) => {
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [analysisData, setAnalysisData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // --- Data Fetching Functions ---
  const fetchDashboardData = useCallback(async () => {
    if (!user || !user.userId) {
      console.log("Skipping fetchDashboardData: user or userId is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // getBalance now returns both balance and categories from backend
      const balanceResponse = await getBalance(user.userId);
      setUserBalance(balanceResponse.balance);
      setCategories(balanceResponse.categories || []); // Ensure categories are set from balance API

      const transactionData = await getTransactions(user.userId);
      setTransactions(transactionData);

      const analysisResponse = await getAnalysis(user.userId);
      setAnalysisData(analysisResponse);

      console.log("All dashboard data fetches complete.");
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.msg || 'Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.userId) {
      console.log("Dashboard useEffect triggered for user:", user.userId);
      fetchDashboardData();
    } else {
      console.log("Dashboard useEffect: User data not yet available.");
    }
  }, [user, fetchDashboardData]);

  const handleDataRefresh = () => {
    fetchDashboardData(); // Trigger a full refresh of all dashboard data
  };

  const handleCategoryManagerClose = () => {
    setShowCategoryManager(false);
    handleDataRefresh(); // Refresh dashboard data after closing category manager
  };

  // --- Styles ---
  const styles = {
    dashboardContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      gap: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: '#f4f7f6',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: '15px 25px',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    },
    title: {
      color: '#333',
      margin: 0,
    },
    logoutButton: {
      padding: '10px 20px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease',
    },
    balanceSection: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '25px',
      borderRadius: '8px',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    },
    balanceText: {
      fontSize: '1.2em',
      margin: '0 0 10px 0',
    },
    balanceAmount: {
      fontSize: '2.5em',
      fontWeight: 'bold',
      margin: 0,
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr', // Default for smaller screens
      gap: '20px',
    },
    sectionTitle: {
      color: '#444',
      marginBottom: '15px',
      borderBottom: '2px solid #eee',
      paddingBottom: '5px',
    },
    navBar: {
      display: 'flex',
      justifyContent: 'space-around',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      padding: '10px',
      flexWrap: 'wrap', // Allow wrapping on smaller screens
      gap: '10px', // Spacing between buttons
    },
    navButton: {
      flex: '1 1 auto', // Allow buttons to grow and shrink
      minWidth: '120px', // Minimum width for buttons
      padding: '12px 15px',
      backgroundColor: '#e9ecef',
      color: '#333',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease, transform 0.1s ease',
    },
    navButtonActive: {
      backgroundColor: '#007bff',
      color: 'white',
      transform: 'translateY(-2px)',
      // FIX: Corrected typo from 'box boxShadow' to 'boxShadow'
      boxShadow: '0 2px 8px rgba(0,123,255,0.3)',
    },
    modalOverlay: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000',
    },
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
  }

  if (!user || !user.userId) {
    console.log("Dashboard: user object or userId is missing, cannot render content.");
    return <div style={{ textAlign: 'center', padding: '50px', color: 'orange' }}>User data not available. Please try logging in again.</div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>PayWise Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout 👋
        </button>
      </header>

      {/* Navigation Bar */}
      <nav style={styles.navBar}>
        <button
          style={{ ...styles.navButton, ...(activeSection === 'home' && styles.navButtonActive) }}
          onClick={() => setActiveSection('home')}
        >
          Home 🏠
        </button>
        <button
          style={{ ...styles.navButton, ...(activeSection === 'sendMoney' && styles.navButtonActive) }}
          onClick={() => setActiveSection('sendMoney')}
        >
          Send Money 💸
        </button>
        <button
          style={{ ...styles.navButton, ...(activeSection === 'transactions' && styles.navButtonActive) }}
          onClick={() => setActiveSection('transactions')}
        >
          Transactions 🔄
        </button>
        <button
          style={{ ...styles.navButton, ...(activeSection === 'analysis' && styles.navButtonActive) }}
          onClick={() => setActiveSection('analysis')}
        >
          Analysis & Charts 📊📈
        </button>
        <button
          style={{ ...styles.navButton, ...(activeSection === 'manageCategories' && styles.navButtonActive) }}
          onClick={() => setShowCategoryManager(true)} // This button opens the modal
        >
          Manage Categories ⚙️
        </button>
      </nav>

      {/* Main Content Area - Conditional Rendering */}
      <div style={styles.mainContent}>
        {activeSection === 'home' && (
          <section style={styles.balanceSection}>
            <p style={styles.balanceText}>Your Current Balance:</p>
            <p style={styles.balanceAmount}>₹{userBalance !== undefined && userBalance !== null ? userBalance.toFixed(2) : '0.00'}</p>
            <p style={{marginTop: '15px', fontSize: '0.9em', color: 'rgba(255,255,255,0.8)'}}>Welcome, {user.name}!</p>
          </section>
        )}

        {activeSection === 'sendMoney' && (
          <section>
            <h2 style={styles.sectionTitle}>Send Money 💸</h2>
            <SendMoneyForm
              senderId={user.userId}
              onTransactionSuccess={handleDataRefresh}
              userBalance={userBalance}
              categories={categories}
            />
          </section>
        )}

        {activeSection === 'transactions' && (
          <section>
            <h2 style={styles.sectionTitle}>Recent Transactions 🔄</h2>
            <TransactionHistory transactions={transactions} currentUserId={user.userId} />
          </section>
        )}

        {activeSection === 'analysis' && (
          <section>
            <h2 style={styles.sectionTitle}>Spending Analysis & Charts 📊📈</h2>
            <SpendingAnalysis
              userId={user.userId}
              analysisData={analysisData}
              onRefreshAnalysis={handleDataRefresh}
              categories={categories}
            />
          </section>
        )}
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div style={styles.modalOverlay} onClick={handleCategoryManagerClose}>
          <CategoryManager userId={user.userId} onClose={handleCategoryManagerClose} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;