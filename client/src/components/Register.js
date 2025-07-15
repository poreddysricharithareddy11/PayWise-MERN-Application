import React, { useState } from 'react';
import { register } from '../api';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    console.log('Register Form Submission (Frontend) - Name:', name);
    console.log('Register Form Submission (Frontend) - UPI ID:', upiId);
    console.log('Register Form Submission (Frontend) - Phone Number:', phoneNumber);
    console.log('Register Form Submission (Frontend) - Password:', password);

    if (!name || !upiId || !phoneNumber || !password) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await register({ name, upiId, phoneNumber, password });
      setMessage(response.data.msg);
      onRegisterSuccess();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Registration failed. Please try again.');
      console.error('Registration error:', error.response?.data || error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
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
