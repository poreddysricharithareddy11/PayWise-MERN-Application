// client/src/components/Login.js
import React, { useState } from 'react';
import { login } from '../api';

const Login = ({ setUser, onSwitchToRegister }) => {
  const [identifier, setIdentifier] = useState(''); // Can be UPI ID or Phone Number
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    try {
      // responseData here already IS the data payload from the backend (e.g., { token: "...", user: { ... } })
      const responseData = await login({ identifier, password });

      localStorage.setItem('token', responseData.token); // Access token directly from responseData
      localStorage.setItem('user', JSON.stringify(responseData.user)); // Store user object for reloads
      setUser(responseData.user); // Access user object directly from responseData

      console.log("Login successful! User data received:", responseData.user);

    } catch (err) {
      console.error('Login error:', err);
      // If error.response exists and has data.msg, use it. Otherwise, a generic message.
      setErrorMessage(err.response?.data?.msg || 'Login failed: An unexpected error occurred.');
    }
  };

  const styles = {
    loginContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      backgroundColor: '#f0f2f5',
    },
    loginBox: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    title: {
      color: '#333',
      marginBottom: '20px',
      fontSize: '1.8em',
    },
    formGroup: {
      marginBottom: '15px',
      textAlign: 'left',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#555',
      fontWeight: 'bold',
    },
    input: {
      width: 'calc(100% - 20px)', // Account for padding
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      fontSize: '1em',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '1.1em',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'background-color 0.3s ease',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
    errorMessage: {
      color: '#dc3545',
      marginTop: '15px',
      fontWeight: 'bold',
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
    },
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="identifier" style={styles.label}>UPI ID or Phone Number</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Login</button>
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

        {/* Add register link below the form */}
        <div style={{ marginTop: '20px', fontSize: '1em' }}>
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
            Register
          </button>
        </div>
        {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Login;