const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Assuming User model is needed to attach user details to req

/**
 * @desc Middleware to protect routes, ensuring only authenticated users can access them.
 *       It verifies the JWT token sent in the Authorization header.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the Authorization header
      // Format: "Bearer TOKEN_STRING"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the JWT secret from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user associated with the token's ID and attach it to the request object.
      // We select all fields except the password for security.
      req.user = await User.findById(decoded.id).select('-password');

      // If no user is found for the decoded ID, it means the user might have been deleted
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Authentication error:', error.message);

      // If token verification fails (e.g., expired, invalid signature), send 401 Unauthorized
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If no token is provided in the header, send 401 Unauthorized
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * @desc Middleware to authorize users based on their roles.
 *       This function returns a middleware that checks if the authenticated user's role
 *       is included in the allowed roles list.
 * @param {...string} roles - A list of roles that are allowed to access the route.
 * @returns {Function} An Express middleware function.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user is authenticated and has a role
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Not authorized, user role not found' });
    }

    // Check if the user's role is among the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this resource` });
    }

    // If authorized, proceed to the next middleware or route handler
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};