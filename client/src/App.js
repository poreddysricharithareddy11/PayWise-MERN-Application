import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css'; // Assuming this CSS file exists and is relevant

function App() {
  const [user, setUser] = useState(null); // Stores user object with userId and name
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Function to handle logout - clears user state and token
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    // Optionally, navigate to login page if using react-router-dom
    // history.push('/login'); // If you set up history
  };

  // Check for token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    // In a real app, you'd send this token to your backend to validate it
    // and fetch user details. For simplicity here, we'll simulate.
    // A more robust way would be to have a verifyToken API endpoint.
    // For now, if a token exists, we assume the user is "logged in" for initial render.
    // The Dashboard component will then attempt to fetch actual user data.
    if (token) {
      // This is a placeholder. Ideally, you'd call an API to get user details
      // based on the token. For now, we proceed assuming user data will be
      // fetched by Dashboard.
      // If you stored user details (userId, name, upiId) in localStorage along with token,
      // you could retrieve them here:
      // const storedUser = JSON.parse(localStorage.getItem('user'));
      // if (storedUser) {
      //   setUser(storedUser);
      // }
    }
    setInitialLoadComplete(true);
  }, []);


  // Only render Login/Dashboard after initial token check is complete
  if (!initialLoadComplete) {
    return <div style={{textAlign: 'center', padding: '50px'}}>Loading application...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>PayWise - An Online Money Transaction Application</h1>
      </header>
      {user ? (
        <Dashboard user={user} handleLogout={handleLogout} />
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

export default App;