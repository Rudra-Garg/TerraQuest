// src/services/authService.js
import axios from "axios";

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  // Add CORS configuration
  withCredentials: true,
  credentials: "include",
});

// Optional: Add interceptors similar to gameService if needed (e.g., for logging)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Auth API Error:",
      error.response?.status,
      error.response?.data || error.message,
    );
    // Return a structured error or just re-throw
    return Promise.reject(error.response?.data || { error: error.message }); // Return backend error message if available
  },
);

export default {
  /**
   * Registers a new user.
   * @param {object} userData - { username, email, password }
   * @returns {Promise<object>} - Promise resolving with backend response data on success.
   */
  async register(userData) {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Logs in a user.
   * @param {object} credentials - { email, password }
   * @returns {Promise<object>} - Promise resolving with backend response data on success.
   */
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Resets a user's password using a recovery code.
   * @param {object} payload - { email, recoveryCode, newPassword }
   * @returns {Promise<object>} - Promise resolving with backend response data on success.
   */
  async resetPassword(payload) {
    const response = await apiClient.post("/auth/reset-password", payload);
    return response.data;
  },

  /**
   * Fetches the authenticated user's profile and aggregated stats.
   * @param {string} token
   * @returns {Promise<object>}
   */
  async getProfile(token) {
    const response = await apiClient.get("/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Fetches leaderboard data.
   * @param {string} token
   * @returns {Promise<Array>}
   */
  async getLeaderboard(token) {
    const response = await apiClient.get("/leaderboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Fetches the authenticated user's solo game history.
   * @param {string} token
   * @returns {Promise<Array>}
   */
  async getGameHistory(token) {
    const response = await apiClient.get("/game/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
