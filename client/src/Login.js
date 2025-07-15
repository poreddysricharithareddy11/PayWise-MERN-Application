import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post('http://localhost:5000/api/users/login', { identifier });
    localStorage.setItem('user', JSON.stringify(res.data));
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Login with Phone or UPI</h2>
      <input placeholder="Phone or UPI" onChange={(e) => setIdentifier(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;


