import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/apiClient'; // Assuming apiClient is an Axios instance configured with interceptors

// Create the Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages user authentication state, including login, logout, and registration.
 * It persists the authentication token in localStorage and provides user data
 * and authentication functions to its children components.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Initial loading state for checking token

  /**
   * Fetches the current user's data from the backend.
   * This is used to validate the token stored in localStorage and populate the user state.
   * It relies on `apiClient` being configured to automatically send the token
   * from localStorage via an interceptor for authenticated requests.
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // apiClient should be configured with an interceptor to attach the token
        // to all outgoing requests if it exists in localStorage.
        // If not, you would manually set the Authorization header here:
        // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await apiClient.get('/auth/me'); // Endpoint to get current user info
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to fetch current user or token invalid:', error);
      // If the token is invalid or expired, clear it from localStorage
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Authentication check is complete
    }
  }, []);

  // On initial mount, check for an existing token and fetch user data
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]); // Dependency array ensures this runs only when fetchCurrentUser changes (which it won't)

  /**
   * Handles user login.
   * On successful login, stores the token in localStorage and updates the auth state.
   * @param {object} credentials - User's email and password.
   * @returns {Promise<object>} - The user data upon successful login.
   * @throws {Error} - If login fails.
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw error; // Re-throw to allow components to handle specific errors (e.g., display error message)
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handles user registration.
   * On successful registration, stores the token (if returned) and updates the auth state,
   * effectively logging the user in immediately.
   * @param {object} userData - User's registration details (e.g., username, email, password).
   * @returns {Promise<object>} - The user data upon successful registration.
   * @throws {Error} - If registration fails.
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token, user: registeredUser } = response.data;
      // Assuming the backend logs in the user immediately after registration and returns a token
      localStorage.setItem('token', token);
      setUser(registeredUser);
      setIsAuthenticated(true);
      return registeredUser;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handles user logout.
   * Clears the token from localStorage and resets the user authentication state.
   */
  const logout = useCallback(() => {
    setLoading(true);
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    // Optionally, you might want to send a request to the server to invalidate the token
    // on the backend as well, though removing it client-side is often sufficient.
    // try {
    //   await apiClient.post('/auth/logout');
    // } catch (error) {
    //   console.error('Server-side logout failed:', error);
    // }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  // when the provider re-renders but the actual values haven't changed.
  const authContextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    fetchCurrentUser, // Expose for re-fetching user data if needed (e.g., after profile update)
  }), [user, isAuthenticated, loading, login, logout, register, fetchCurrentUser]);

  // Render the provider with the memoized value, making it available to all children
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};