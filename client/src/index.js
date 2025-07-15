import React from 'react';
import ReactDOM from 'react-dom/client'; // Use react-dom/client for React 18+
import './index.css'; // Assuming you have a basic index.css for global styles
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a root to render your React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component inside React.StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
