import React, { useState } from 'react';
import { register } from '../api';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    if (!name || !upiId || !password || !confirmPassword) {
      setMessage('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    const registrationData = { name, upiId, password };
    if (phoneNumber) registrationData.phone = phoneNumber;
    try {
      const response = await register(registrationData);
      // If registration is successful, show a success message
      setMessage('Registration is successful');
      onRegisterSuccess();
    } catch (error) {
      // Handle both object and string error responses
      let errMsg = 'Registration failed. Please try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errMsg = error.response.data;
        } else if (error.response.data.msg) {
          errMsg = error.response.data.msg;
        }
      }
      setMessage(errMsg);
      console.error('Registration error:', error.response?.data || error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={styles.input}
          required
        />
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, paddingRight: '38px' }}
            required
            autoComplete="new-password"
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2em', color: '#888', background: 'white', padding: '0 2px' }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '\ud83d\udc41\ufe0f' : '\ud83d\udc41'}
          </span>
        </div>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ ...styles.input, paddingRight: '38px' }}
            required
            autoComplete="new-password"
          />
          <span
            onClick={() => setShowConfirmPassword((v) => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2em', color: '#888', background: 'white', padding: '0 2px' }}
            title={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? '\ud83d\udc41\ufe0f' : '\ud83d\udc41'}
          </span>
        </div>
        <button type="submit" style={styles.button}>Register</button>
      </form>
      {message && <p style={message.includes('successful') ? styles.successText : styles.errorText}>{message}</p>}
      <p style={styles.switchText}>
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} style={styles.switchButton}>
          Login here
        </button>
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1em',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
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
  switchText: {
    marginTop: '20px',
    color: '#555',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '1em',
  },
};

export default Register;
