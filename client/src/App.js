import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Register from './components/Register';
import SEO from './components/SEO';

function App() {
  const [user, setUser] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // Add state for toggling

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If you're storing user info too, you can get it like:
      // const storedUser = JSON.parse(localStorage.getItem('user'));
      // setUser(storedUser);
    }
    setInitialLoadComplete(true);
  }, []);

  if (!initialLoadComplete) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading application...</div>;
  }

  return (
    <div className="App">
      <SEO />
      <header className="App-header">
        <h1>PayWise - An Online Money Transaction Application</h1>
      </header>

      {user ? (
        <Dashboard user={user} handleLogout={handleLogout} />
      ) : showRegister ? (
        <Register
          onRegisterSuccess={() => setShowRegister(false)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      ) : (
        <Login setUser={setUser} onSwitchToRegister={() => setShowRegister(true)} />
      )}

      {/* Toasts will appear here */}
      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
}

export default App;
