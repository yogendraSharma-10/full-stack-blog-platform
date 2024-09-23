require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan'); // HTTP request logger middleware
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Helmet helps secure Express apps by setting various HTTP headers.
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow requests from your client application
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(express.json());

// HTTP request logger middleware for node.js
// 'dev' format is concise, color-coded for development.
// 'combined' format is standard Apache combined log output for production.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Basic route for server health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Blog API is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Error handling middleware
// This should be the last middleware added to the Express app.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';
  res.status(statusCode).json({
    success: false,
    message: message,
    // In production, avoid sending detailed error stack to the client
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 Not Found errors
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});