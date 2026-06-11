import React from 'react';

/**
 * Footer component for the blog application.
 * Displays copyright information and a link to the project repository.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-text">
          &copy; {currentYear} Full-Stack Blog Platform. All rights reserved.
        </p>
        <p className="footer-text">
          Developed with <span role="img" aria-label="heart">❤️</span> using React, Node.js, Express, and MongoDB.
        </p>
        {/* Optional: Add a link to the project's GitHub repository or author's portfolio */}
        <p className="footer-text">
          <a
            href="https://github.com/your-username/your-blog-repo" // Replace with actual GitHub repo link
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;