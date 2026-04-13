import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ✅ Fix ResizeObserver error
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.toString().includes("ResizeObserver loop")) return;
  originalError(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);