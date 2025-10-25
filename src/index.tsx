import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Main entry point for the EyeWitness satellite monitoring application
 * 
 * This file is the starting point of our React application. It:
 * 1. Creates a React root element
 * 2. Renders our main App component
 * 3. Wraps everything in React.StrictMode for better development experience
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);