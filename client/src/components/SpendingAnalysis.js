import React, { useState, useEffect, useCallback } from 'react';
import { setCategoryLimit, getMonthlySpendingAnalytics } from '../api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const SpendingAnalysis = ({ userId, analysisData, onRefreshAnalysis, categories }) => {
  const [limitInput, setLimitInput] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [monthlySpendingData, setMonthlySpendingData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [errorCharts, setErrorCharts] = useState(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const styles = {
    container: {
      backgroundColor: '#fff',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      marginTop: '20px',
    },
    noData: {
      textAlign: 'center',
      padding: '30px',
      fontSize: '1.1em',
      color: '#888',
    },
    summary: {
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid #eee',
      fontSize: '1.1em',
      fontWeight: 'bold',
    },
    spentAmount: {
      color: '#dc3545',
    },
    receivedAmount: {
      color: '#28a745',
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
      gap: '10px',
    },
    categoryMainInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      alignItems: 'center',
    },
    categoryNameInfo: {
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
    amounts: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'right',
      fontSize: '0.95em',
    },
    itemSpent: {
      color: '#dc3545',
    },
    itemReceived: {
      color: '#28a745',
    },
    itemNet: (netValue) => ({
      fontWeight: 'bold',
      color: netValue >= 0 ? '#28a745' : '#dc3545',
    }),
    limitSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      backgroundColor: '#f9f9f9',
      padding: '8px 10px',
      borderRadius: '5px',
      border: '1px solid #eee',
    },
    limitLabel: {
      fontWeight: 'bold',
      fontSize: '0.9em',
      color: '#555',
      minWidth: '70px',
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
    chartsContainer: {
      backgroundColor: '#fff',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginTop: '30px',
      marginBottom: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px',
    },
    chartSectionTitle: {
      color: '#333',
      fontSize: '1.8em',
      marginBottom: '15px',
      borderBottom: '2px solid #007bff',
      paddingBottom: '10px',
      width: '100%',
      textAlign: 'center',
    },
    chartWrapper: {
      width: '100%',
      maxWidth: '600px',
      height: '400px',
      padding: '10px',
    },
    loadingCharts: {
      fontSize: '1.2em',
      color: '#666',
      textAlign: 'center',
      padding: '20px',
    },
    errorCharts: {
      fontSize: '1.2em',
      color: 'red',
      textAlign: 'center',
      padding: '20px',
    },
    noChartsData: {
      fontSize: '1.2em',
      color: '#888',
      textAlign: 'center',
      padding: '20px',
      fontStyle: 'italic',
    },
    noSpendingNote: {
      fontSize: '0.85em',
      color: '#666',
      marginTop: '10px',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    navigation: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: '600px',
      marginBottom: '20px',
      backgroundColor: '#f0f4f8',
      padding: '10px 20px',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    },
    navButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      padding: '8px 15px',
      cursor: 'pointer',
      fontSize: '0.9em',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease',
      '&:disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
      }
    },
    currentMonthDisplay: {
      fontSize: '1.1em',
      fontWeight: 'bold',
      color: '#333',
    }
  };

  useEffect(() => {
    const initialLimits = {};
    analysisData.forEach(cat => {
      initialLimits[cat.name] = cat.limit > 0 ? cat.limit.toString() : '';
    });
    setLimitInput(initialLimits);
  }, [analysisData]);

  const fetchMonthlySpendingData = useCallback(async () => {
    setLoadingCharts(true);
    setErrorCharts(null);
    try {
      const response = await getMonthlySpendingAnalytics(userId);
      const sortedData = [...response].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
      setMonthlySpendingData(sortedData);
      if (sortedData.length > 0) {
        setCurrentMonthIndex(sortedData.length - 1);
      } else {
        setCurrentMonthIndex(0);
      }
    } catch (err) {
      setErrorCharts(err.response?.data?.msg || 'Failed to fetch spending data for charts.');
      console.error("Error fetching analytics for charts:", err);
    } finally {
      setLoadingCharts(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchMonthlySpendingData();
    }
  }, [userId, onRefreshAnalysis, fetchMonthlySpendingData]);

  const handlePrevMonth = () => {
    setCurrentMonthIndex(prevIndex => Math.max(0, prevIndex - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex(prevIndex => Math.min(monthlySpendingData.length - 1, prevIndex + 1));
  };

  if (!analysisData || analysisData.length === 0) {
    return <div style={styles.noData}>No analysis data available yet. Start making transactions! 📊</div>;
  }

  const totalSpent = analysisData.reduce((sum, cat) => sum + cat.spent, 0);
  const totalReceived = analysisData.reduce((sum, cat) => sum + cat.received, 0);

  const predefinedOrder = ['Shopping', 'Groceries', 'Food', 'Rent', 'Other'];

  const sortedAnalysis = [...analysisData].sort((a, b) => {
    const aIndex = predefinedOrder.indexOf(a.name);
    const bIndex = predefinedOrder.indexOf(b.name);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (a.type === 'predefined' && b.type === 'custom') return -1;
    if (a.type === 'custom' && b.type === 'predefined') return 1;

    return (b.spent - b.received) - (a.spent - a.received);
  });

  const categoryEmojis = {
    'Shopping': '🛍️',
    'Groceries': '🛒',
    'Food': '🍔',
    'Rent': '🏠',
    'Other': '❓',
    'default': '✨'
  };

  const handleLimitInputChange = (categoryName, value) => {
    setLimitInput(prev => ({
      ...prev,
      [categoryName]: value,
    }));
  };

  const handleSetLimit = async (categoryName) => {
    setMessage('');
    setIsSuccess(false);
    const limitValue = limitInput[categoryName];
    const parsedLimit = parseFloat(limitValue);

    if (limitValue === '' || parsedLimit === 0) {
      try {
        await setCategoryLimit(userId, categoryName, 0);
        setMessage(`Limit for "${categoryName}" removed. ✅`);
        setIsSuccess(true);
        onRefreshAnalysis();
        setLimitInput(prev => ({ ...prev, [categoryName]: '' }));
      } catch (error) {
        setMessage(error.response?.data?.msg || `Error removing limit for ${categoryName} ❌`);
        setIsSuccess(false);
        console.error('Error removing limit:', error);
      }
      return;
    }

    if (isNaN(parsedLimit) || parsedLimit < 0) {
      setMessage('Limit must be a non-negative number.');
      setIsSuccess(false);
      return;
    }

    try {
      await setCategoryLimit(userId, categoryName, parsedLimit);
      setMessage(`Limit for "${categoryName}" set to ₹${parsedLimit.toFixed(2)}. ✅`);
      setIsSuccess(true);
      onRefreshAnalysis();
    } catch (error) {
      setMessage(error.response?.data?.msg || `Error setting limit for ${categoryName} ❌`);
      setIsSuccess(false);
      console.error('Error setting limit:', error);
    }
  };

  const currentMonthChartsData = monthlySpendingData[currentMonthIndex];

  let pieChartData = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#fff',
      borderWidth: 1,
    }],
  };

  const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#E7E9ED', '#8AC926', '#1982C4', '#6A4C93', '#FFCA3A', '#6A994E'
  ];

  if (currentMonthChartsData && currentMonthChartsData.categories) {
    const categoriesWithSpending = currentMonthChartsData.categories.filter(cat => cat.amount > 0);
    if (categoriesWithSpending.length > 0) {
        pieChartData = {
            labels: categoriesWithSpending.map(cat => cat.category),
            datasets: [
                {
                    data: categoriesWithSpending.map(cat => cat.amount),
                    backgroundColor: categoriesWithSpending.map((_, index) => COLORS[index % COLORS.length]),
                    borderColor: '#fff',
                    borderWidth: 2,
                },
            ],
        };
    }
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: currentMonthChartsData && currentMonthChartsData.year && currentMonthChartsData.month ? `Spending by Category for ${new Date(currentMonthChartsData.year, currentMonthChartsData.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}` : 'Spending by Category',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#333',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
              label += `₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
            }
            return label;
          }
        }
      }
    },
  };


  return (
    <div style={styles.container}>
      <h3>Your Spending & Receiving Analysis 📊</h3>
      {message && (
        <p style={isSuccess ? { ...styles.message, ...styles.successMessage } : { ...styles.message, ...styles.errorMessage }}>
          {message}
        </p>
      )}

      <div style={styles.summary}>
        <p>Total Spent: <span style={styles.spentAmount}>₹{totalSpent.toFixed(2)}</span></p>
        <p>Total Received: <span style={styles.receivedAmount}>₹{totalReceived.toFixed(2)}</span></p>
      </div>
      <ul style={styles.list}>
        {sortedAnalysis.map((cat) => {
          const netAmount = cat.received - cat.spent;
          return (
            <li key={cat.name} style={styles.listItem}>
              <div style={styles.categoryMainInfo}>
                <div style={styles.categoryNameInfo}>
                  <span style={styles.emoji}>{categoryEmojis[cat.name] || categoryEmojis['default']}</span>
                  <strong>{cat.name}</strong>
                  {cat.type === 'custom' && <span style={styles.customTag}>(Custom)</span>}
                </div>
                <div style={styles.amounts}>
                  <span style={styles.itemSpent}>Spent: ₹{cat.spent.toFixed(2)}</span>
                  <span style={styles.itemReceived}>Received: ₹{cat.received.toFixed(2)}</span>
                  <span style={styles.itemNet(netAmount)}>
                    Net: {netAmount >= 0 ? '+' : ''}₹{netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div style={styles.limitSection}>
                <span style={styles.limitLabel}>Limit: {cat.limit > 0 ? `₹${cat.limit.toFixed(2)}` : 'No Limit'}</span>
                <input
                  type="number"
                  placeholder="Set Limit (0 for no limit)"
                  value={limitInput[cat.name] || ''}
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
          );
        })}
      </ul>
      <p style={styles.note}>Note: This analysis shows how much money has been associated with each category you've chosen when sending money, and how much you've received under those categories. Categories with zero activity are hidden unless they are predefined and have a limit set. Use the input fields to set spending limits per category.</p>

      {/* Charts Section */}
      <div style={styles.chartsContainer}>
        <h3 style={styles.chartSectionTitle}>Monthly Spending Overview 📈</h3>

        {loadingCharts ? (
          <div style={styles.loadingCharts}>Loading spending charts...</div>
        ) : errorCharts ? (
          <div style={styles.errorCharts}>Error: {errorCharts}</div>
        ) : monthlySpendingData.length > 0 ? (
          <>
            <div style={styles.navigation}>
              <button
                onClick={handlePrevMonth}
                disabled={currentMonthIndex === 0}
                style={styles.navButton}
              >
                ← Previous Month
              </button>
              <span style={styles.currentMonthDisplay}>
                {/* Display current month name even if no data for it */}
                {currentMonthChartsData && currentMonthChartsData.year && currentMonthChartsData.month ?
                  new Date(currentMonthChartsData.year, currentMonthChartsData.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
                  : new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} {/* Fallback to current real month */}
              </span>
              <button
                onClick={handleNextMonth}
                disabled={currentMonthIndex === monthlySpendingData.length - 1}
                style={styles.navButton}
              >
                Next Month →
              </button>
            </div>

            {currentMonthChartsData && currentMonthChartsData.categories.some(cat => cat.amount > 0) ? (
              <div style={styles.chartWrapper}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            ) : (
              <p style={styles.noSpendingNote}>
                No spending recorded for {currentMonthChartsData && currentMonthChartsData.year && currentMonthChartsData.month ?
                  new Date(currentMonthChartsData.year, currentMonthChartsData.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
                  : new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
              </p>
            )}
            {currentMonthChartsData && currentMonthChartsData.categories.some(cat => cat.amount === 0) && (
                <p style={styles.noSpendingNote}>Note: Categories with zero spending in the current month are not shown in the pie chart.</p>
            )}
          </>
        ) : (
          <p style={styles.noChartsData}>No spending data available for charts. Make some transactions!</p>
        )}
      </div>
    </div>
  );
};

export default SpendingAnalysis;