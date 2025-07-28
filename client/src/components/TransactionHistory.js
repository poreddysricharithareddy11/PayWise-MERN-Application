import React, { useState } from 'react';
import { getSingleTransaction } from '../api';

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
      maxWidth: '500px',
      width: '90%',
      position: 'relative',
      maxHeight: '80vh',
      overflowY: 'auto',
    },
    closeButton: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'none',
      border: 'none',
      fontSize: '1.5em',
      cursor: 'pointer',
      color: '#666',
    },
    title: {
      textAlign: 'center',
      color: '#007bff',
      marginBottom: '20px',
      fontSize: '1.8em',
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #eee',
      fontSize: '0.95em',
    },
    amount: {
      fontWeight: 'bold',
      color: '#28a745',
    },
    messagesSection: {
      marginTop: '20px',
      borderTop: '1px solid #eee',
      paddingTop: '15px',
    },
    messagesTitle: {
      fontSize: '1.2em',
      color: '#555',
      marginBottom: '10px',
    },
    messagesList: {
      listStyleType: 'none',
      padding: 0,
    },
    messageItem: {
      backgroundColor: '#f9f9f9',
      padding: '8px 12px',
      borderRadius: '5px',
      marginBottom: '5px',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '0.9em',
    },
    messageTimestamp: {
      fontSize: '0.75em',
      color: '#999',
      marginTop: '2px',
      alignSelf: 'flex-end',
    },
    noMessages: {
      fontStyle: 'italic',
      color: '#888',
      textAlign: 'center',
      marginTop: '15px',
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <button onClick={onClose} style={modalStyles.closeButton}>✖️</button>
        <h3 style={modalStyles.title}>Transaction Details</h3>
        <div style={modalStyles.detailRow}><strong>ID:</strong> <span>{transaction._id}</span></div>
        <div style={modalStyles.detailRow}>
          <strong>From:</strong> <span>{transaction.senderId.name} ({transaction.senderId.upiId})</span>
        </div>
        <div style={modalStyles.detailRow}>
          <strong>To:</strong> <span>{transaction.receiverId.name} ({transaction.receiverId.upiId})</span>
        </div>
        <div style={modalStyles.detailRow}>
          <strong>Amount:</strong> <span style={modalStyles.amount}>₹{transaction.amount.toFixed(2)}</span>
        </div>
        <div style={modalStyles.detailRow}><strong>Category:</strong> <span>{transaction.category || 'N/A'}</span></div>
        <div style={modalStyles.detailRow}>
          <strong>Date:</strong> <span>{new Date(transaction.timestamp).toLocaleString()}</span>
        </div>

        {transaction.messages?.length > 0 ? (
          <div style={modalStyles.messagesSection}>
            <h4 style={modalStyles.messagesTitle}>Messages:</h4>
            <ul style={modalStyles.messagesList}>
              {transaction.messages.map((msg, index) => (
                <li key={index} style={modalStyles.messageItem}>
                  <strong>{msg.sender?.name || 'Unknown'}:</strong> {msg.message}
                  <span style={modalStyles.messageTimestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={modalStyles.noMessages}>No messages for this transaction.</p>
        )}
      </div>
    </div>
  );
};

const TransactionHistory = ({ transactions, currentUserId }) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalError, setModalError] = useState(null);

  const getTransactionType = (txn) =>
    txn.senderId._id === currentUserId ? 'Sent' : 'Received';

  const getPartnerName = (txn) =>
    txn.senderId._id === currentUserId ? txn.receiverId.name : txn.senderId.name;

  const getPartnerUpiId = (txn) =>
    txn.senderId._id === currentUserId ? txn.receiverId.upiId : txn.senderId.upiId;

  const handleViewDetails = async (transactionId) => {
    setLoadingModal(true);
    setModalError(null);
    setSelectedTransaction(null);
    setModalOpen(true);

    try {
      const details = await getSingleTransaction(transactionId);
      setSelectedTransaction(details);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setModalError(error.response?.data?.msg || 'Failed to fetch transaction details.');
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
    setModalError(null);
  };

  return (
    <div style={styles.container}>
      <h3>Transaction History 📜</h3>
      {transactions.length === 0 ? (
        <p style={styles.noTransactions}>No transactions yet. Start sending or receiving money!</p>
      ) : (
        <ul style={styles.list}>
          {transactions.map((txn) => {
            const type = getTransactionType(txn);
            const amountPrefix = type === 'Sent' ? '-' : '+';
            return (
              <li key={txn._id} style={styles.listItem} onClick={() => handleViewDetails(txn._id)}>
                <div style={styles.transactionInfo}>
                  <span style={styles.transactionType(type)}>{type}</span>
                  <span style={styles.partnerInfo}>
                    {type === 'Sent' ? 'to' : 'from'} {getPartnerName(txn)} ({getPartnerUpiId(txn)})
                  </span>
                  <span style={styles.category}>Category: {txn.category || 'Uncategorized'}</span>
                  <span style={styles.date}>{new Date(txn.timestamp).toLocaleDateString()}</span>
                </div>
                <div style={styles.transactionAmount}>
                  <span style={styles.amount(type)}>{amountPrefix}₹{txn.amount.toFixed(2)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalOpen && (
        <>
          {modalError ? (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{modalError}</div>
          ) : loadingModal ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading transaction details...</div>
          ) : (
            <TransactionDetailsModal transaction={selectedTransaction} onClose={closeModal} />
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;

// Shared styles (outside the components)
const styles = {
  container: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    marginTop: '30px',
  },
  noTransactions: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontStyle: 'italic',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 10px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
  },
  transactionInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  transactionType: (type) => ({
    fontWeight: 'bold',
    color: type === 'Sent' ? '#dc3545' : '#28a745',
    marginBottom: '4px',
    fontSize: '0.95em',
  }),
  partnerInfo: {
    fontSize: '0.9em',
    color: '#555',
    marginBottom: '2px',
  },
  category: {
    fontSize: '0.8em',
    color: '#888',
    backgroundColor: '#e9ecef',
    padding: '2px 6px',
    borderRadius: '3px',
    marginTop: '4px',
  },
  date: {
    fontSize: '0.75em',
    color: '#999',
    marginTop: '4px',
  },
  transactionAmount: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  amount: (type) => ({
    fontWeight: 'bold',
    fontSize: '1.1em',
    color: type === 'Sent' ? '#dc3545' : '#28a745',
  }),
};
