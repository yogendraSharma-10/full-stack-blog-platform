import axios from 'axios';

/**
 * @file apiClient.js
 * @description Configures and exports an Axios instance for making API requests.
 * It includes request and response interceptors for handling authentication tokens
 * and common API errors.
 */

// Determine the API base URL based on the environment.
// In a React application, environment variables are typically prefixed with REACT_APP_.
// Fallback to a default localhost URL if the environment variable is not set.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Creates a new Axios instance with a predefined base URL and headers.
 * This instance will be used for all API calls in the client application.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // `withCredentials` is crucial for sending cookies (e.g., HTTP-only refresh tokens)
  // with cross-origin requests. This ensures that session-related cookies are
  // automatically included in requests and handled by the browser.
  withCredentials: true,
});

/**
 * Request Interceptor:
 * This interceptor is executed before each request is sent.
 * It's used to attach the authorization token (JWT) to the request headers
 * if a token is found in `localStorage`.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the authentication token from localStorage.
    const token = localStorage.getItem('token');

    // If a token exists, add it to the 'Authorization' header in the Bearer token format.
    // This is a common practice for JWT authentication.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // If there's an error during the request setup, log it and reject the promise.
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * This interceptor is executed for every response received from the API.
 * It's used to handle common API error responses, such as unauthorized access (401)
 * or forbidden access (403), and can perform actions like logging out the user.
 */
apiClient.interceptors.response.use(
  (response) => {
    // If the response is successful (status 2xx), simply return it.
    return response;
  },
  (error) => {
    // Check if the error has a response from the server.
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data.message || 'An unexpected error occurred.';

      switch (status) {
        case 401:
          // Unauthorized: This typically means the JWT is missing, invalid, or expired.
          // Log the user out by removing the token and potentially redirecting.
          console.error('Unauthorized (401):', errorMessage, 'Logging out...');
          localStorage.removeItem('token');
          // In a real application, you might dispatch a logout action to AuthContext
          // or redirect the user to the login page using React Router's history object.
          // Example: window.location.href = '/auth'; (consider using React Router's navigate)
          break;
        case 403:
          // Forbidden: The user is authenticated but does not have the necessary
          // permissions to access the requested resource.
          console.error('Forbidden (403):', errorMessage, 'You do not have permission.');
          break;
        case 404:
          // Not Found: The requested resource does not exist.
          console.error('Not Found (404):', errorMessage, 'The requested resource was not found.');
          break;
        case 500:
          // Internal Server Error: A generic server-side error.
          console.error('Server Error (500):', errorMessage, 'Please try again later.');
          break;
        default:
          // Handle other HTTP error codes.
          console.error(`API Error ${status}:`, errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received.
      // This can happen due to network issues, CORS problems, or the server being down.
      console.error('No response received from server:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error.
      console.error('Error setting up API request:', error.message);
    }

    // Always reject the promise so that calling components can catch and handle the error.
    return Promise.reject(error);
  }
);

export default apiClient;