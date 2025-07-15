import React, { useState, useEffect, useCallback } from 'react';
import { Pie } from 'react-chartjs-2'; // Removed Bar import
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js'; // Removed Bar-related imports
import { getMonthlySpendingAnalytics } from '../api';

// Register Chart.js components - only Pie chart related ones
ChartJS.register(ArcElement, Title, Tooltip, Legend);

const SpendingCharts = ({ userId, refreshTrigger }) => {
  // Define styles at the very top of the component, before any state or logic
  const styles = {
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
    sectionTitle: {
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
    loading: {
      fontSize: '1.2em',
      color: '#666',
      textAlign: 'center',
      padding: '20px',
    },
    error: {
      fontSize: '1.2em',
      color: 'red',
      textAlign: 'center',
      padding: '20px',
    },
    noData: {
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

  const [monthlySpendingData, setMonthlySpendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // Index for the month to display

  const fetchSpendingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMonthlySpendingAnalytics(userId);
      // Sort data chronologically and set the index to the latest month
      const sortedData = [...response].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
      setMonthlySpendingData(sortedData);
      if (sortedData.length > 0) {
        setCurrentMonthIndex(sortedData.length - 1); // Set to the latest month
      } else {
        setCurrentMonthIndex(0);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch spending data for charts.');
      console.error("Error fetching analytics for charts:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSpendingData();
    }
  }, [userId, refreshTrigger, fetchSpendingData]);

  const handlePrevMonth = () => {
    setCurrentMonthIndex(prevIndex => Math.max(0, prevIndex - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex(prevIndex => Math.min(monthlySpendingData.length - 1, prevIndex + 1));
  };

  if (loading) return <div style={styles.loading}>Loading spending charts...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;

  if (!monthlySpendingData || monthlySpendingData.length === 0) {
    return <div style={styles.noData}>No spending data available for charts. Start making transactions!</div>;
  }

  const currentMonthData = monthlySpendingData[currentMonthIndex];

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

  if (currentMonthData && currentMonthData.categories) {
    const categoriesWithSpending = currentMonthData.categories.filter(cat => cat.amount > 0);
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
        text: currentMonthData ? `Spending by Category for ${new Date(currentMonthData.year, currentMonthData.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}` : 'Spending by Category',
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
    <div style={styles.chartsContainer}>
      <h3 style={styles.sectionTitle}>Monthly Spending Analysis 📈</h3>

      {monthlySpendingData.length > 0 && (
        <div style={styles.navigation}>
          <button
            onClick={handlePrevMonth}
            disabled={currentMonthIndex === 0}
            style={styles.navButton}
          >
            ← Previous Month
          </button>
          <span style={styles.currentMonthDisplay}>
            {currentMonthData ? new Date(currentMonthData.year, currentMonthData.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'No Data'}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={currentMonthIndex === monthlySpendingData.length - 1}
            style={styles.navButton}
          >
            Next Month →
          </button>
        </div>
      )}

      {currentMonthData && currentMonthData.categories.some(cat => cat.amount > 0) ? (
        <div style={styles.chartWrapper}>
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      ) : (
        <p style={styles.noSpendingNote}>No spending recorded for this month.</p>
      )}
      {currentMonthData && currentMonthData.categories.some(cat => cat.amount === 0) && (
          <p style={styles.noSpendingNote}>Note: Categories with zero spending in the current month are not shown in the pie chart.</p>
      )}
    </div>
  );
};

export default SpendingCharts;