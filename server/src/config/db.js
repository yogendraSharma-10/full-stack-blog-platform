const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' }); // Ensure dotenv loads from the correct path

/**
 * @function connectDB
 * @description Establishes a connection to the MongoDB database using Mongoose.
 * The MongoDB URI is loaded from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,       // Recommended for new connections
      useUnifiedTopology: true,    // Recommended for new connections
      // useCreateIndex: true,     // Deprecated in Mongoose 6.0+
      // useFindAndModify: false,  // Deprecated in Mongoose 6.0+
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;