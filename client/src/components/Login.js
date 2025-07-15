// client/src/components/Login.js
import React, { useState } from 'react';
import { login } from '../api';

const Login = ({ setUser }) => {
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
        {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Login;