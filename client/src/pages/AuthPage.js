import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

/**
 * AuthPage component handles user login and registration.
 * It provides a form to switch between login and register modes,
 * manages user input, interacts with the authentication API,
 * and updates the global authentication state.
 */
const AuthPage = () => {
  // State to toggle between login and registration forms
  const [isLogin, setIsLogin] = useState(true);
  // State for form input fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State for displaying error messages
  const [error, setError] = useState('');
  // State for managing loading indicator during API calls
  const [loading, setLoading] = useState(false);

  // Access authentication context for login function and current user state
  const { login, user } = useContext(AuthContext);
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Redirect to home page if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  /**
   * Toggles the form mode between login and registration.
   * Clears any previous error messages and input fields when switching.
   */
  const handleToggleMode = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setError(''); // Clear error when switching modes
    setEmail('');
    setUsername('');
    setPassword('');
  };

  /**
   * Handles the form submission for both login and registration.
   * Prevents default form behavior, makes an API call, and handles success/failure.
   * @param {Object} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      let response;
      if (isLogin) {
        // Login API call
        response = await apiClient.post('/auth/login', { email, password });
      } else {
        // Registration API call
        response = await apiClient.post('/auth/register', { username, email, password });
      }

      // On successful authentication, update context and navigate
      login(response.data.token, response.data.user);
      navigate('/'); // Redirect to home page
    } catch (err) {
      // Handle API errors
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
      setError(errorMessage);
      console.error('Authentication error:', err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
          </div>

          {!isLogin && ( // Render username field only for registration
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin} // Required only for registration
                aria-label="Username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="auth-toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button type="button" className="btn-link" onClick={handleToggleMode}>
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;