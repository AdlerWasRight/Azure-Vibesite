/// <reference types="node" />
import axios, { InternalAxiosRequestConfig } from 'axios';

// Define the key used for storing the JWT token in localStorage (must match AuthContext.tsx)
const JWT_TOKEN_STORAGE_KEY = 'aegisAuthToken';
// const USER_ID_STORAGE_KEY = 'aegisUserId'; // REMOVED

// Set the base URL for all requests
axios.defaults.baseURL = 'https://bigatch-ddf9d2cwhzbuckfd.westus2-01.azurewebsites.net'

// Ensure cookies are NOT sent with requests
// axios.defaults.withCredentials = false; // Already removed/commented

// Add a request interceptor to include the JWT Authorization header
axios.interceptors.request.use(
    // Use InternalAxiosRequestConfig which guarantees headers exist
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
        if (token) {
            // Headers are guaranteed to exist on InternalAxiosRequestConfig
            config.headers.Authorization = `Bearer ${token}`;
            // console.log('Interceptor adding Authorization header.'); // For debugging
        } else {
             // Ensure Authorization header is removed if no token exists
             // (axios might reuse headers in some scenarios)
             delete config.headers.Authorization;
        }
        // Remove the old X-User-ID header if it was somehow still there
        delete config.headers['X-User-ID'];

        return config;
    },
    (error: any) => {
        // Do something with request error
        console.error("Interceptor Request Error:", error);
        return Promise.reject(error);
    }
);

// Optional: Add default headers if needed (example commented out)
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// Optional: Add response interceptors for global error handling, logging, etc.
/*
axios.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response, null, 2));
  return response;
}, (error: any) => {
  console.error('Axios Response Error:', error.response || error.message);
  // Potentially redirect to login on 401/403 errors globally
  if (error.response && (error.response.status === 401 || error.response.status === 403) ) {
     // Maybe clear stored user ID if unauthorized/forbidden?
     // localStorage.removeItem(USER_ID_STORAGE_KEY);
     // window.location.href = '/login'; // Force redirect (be careful)
  }
  return Promise.reject(error);
});
*/

export default axios; // Export the configured instance if needed elsewhere, though defaults are usually sufficient 