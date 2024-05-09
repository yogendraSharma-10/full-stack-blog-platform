import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // Global styles for the application
import App from './App'; // The main application component
import { AuthProvider } from './context/AuthContext'; // Context provider for authentication

/**
 * The entry point of the React application.
 * It renders the root component into the DOM.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 
      AuthProvider wraps the entire application to provide authentication
      context (user state, login/logout functions) to all components
      that need it, via the useContext hook.
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(); // This line is typically commented out or removed in production unless specific performance monitoring is needed.