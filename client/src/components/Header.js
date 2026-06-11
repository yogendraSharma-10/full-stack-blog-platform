import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Header component for the blog application.
 * Displays the site title, navigation links, and user authentication status.
 */
const Header = () => {
  // Access authentication context to get user info and logout function
  const { user, logout } = useContext(AuthContext);
  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Handles the logout action.
   * Calls the logout function from AuthContext and redirects to the home page.
   */
  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="header">
      <nav className="navbar">
        {/* Site Logo/Title - links to the home page */}
        <Link to="/" className="navbar-brand">
          Blog Platform
        </Link>

        {/* Main navigation links */}
        <div className="navbar-links">
          <Link to="/" className="nav-item">Home</Link>

          {/* "Create Post" link visible only if the user is logged in */}
          {user && (
            <Link to="/create-post" className="nav-item">Create Post</Link>
          )}
        </div>

        {/* Authentication/User specific links */}
        <div className="navbar-auth">
          {user ? (
            // If user is logged in, display welcome message and Logout button
            <>
              <span className="nav-item welcome-message">Welcome, {user.username}!</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            // If no user is logged in, display Login/Register link
            <Link to="/auth" className="btn btn-primary">Login / Register</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;