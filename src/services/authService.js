// src/services/authService.js
import axios from 'axios';


const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

const apiClient = axios.create({
    baseURL: `${baseUrl}/api/v1/auth`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add interceptors similar to gameService if needed (e.g., for logging)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Auth API Error:', error.response?.status, error.response?.data || error.message);
        // Return a structured error or just re-throw
        return Promise.reject(error.response?.data || { error: error.message }); // Return backend error message if available
    }
);


export default {
    /**
     * Registers a new user.
     * @param {object} userData - { username, email, password }
     * @returns {Promise<object>} - Promise resolving with backend response data on success.
     */
    async register(userData) {
        // try/catch is handled by the interceptor or the calling action
        const response = await apiClient.post('/register', userData);
        return response.data; // contains { message, user: { id, username, email } }
    },

    /**
     * Logs in a user.
     * @param {object} credentials - { email, password }
     * @returns {Promise<object>} - Promise resolving with backend response data on success.
     */
    async login(credentials) {
        // try/catch is handled by the interceptor or the calling action
        const response = await apiClient.post('/login', credentials);
        return response.data; // contains { message, token, user: { id, username, email } }
    },

    // Optional: Add a function to validate token/get profile later
    // async getProfile(token) { ... }
};