import axios from 'axios';
import { useAuthStore } from '../stores/AuthStore';

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add CORS configuration
  withCredentials: true,
  credentials: 'include'
});

// Interceptors (Optional but useful for centralized logging/error handling)
apiClient.interceptors.request.use(
  (config) => {
    // --- Add Auth Token ---
    const authStore = useAuthStore(); // Get store instance
    const token = authStore.authToken; // Use getter
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Attaching Auth Token to request');
    }
    // ----------------------
    console.log('Starting API Request:', config.method.toUpperCase(), config.url, config.params || '');
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response Status:', response.status, response.config.url);
    return response; // Pass through successful responses
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    // Handle common errors centrally if needed (e.g., 401 Unauthorized -> redirect to login)
    return Promise.reject(error); // Pass through errors
  }
);


// Define API functions
export default {
  /**
   * Starts a new game by fetching random locations from the backend.
   * @param {number} [rounds=5] - Optional number of rounds to request.
   * @returns {Promise<object>} - Promise resolving with { gameId: string, locations: Array<{id: number, lat: number, lng: number}> }
   */
  async startGame(rounds = 5) {
    try {
      const response = await apiClient.get('/game/start', {
        params: { rounds } // Send 'rounds' as a query parameter
      });
      // Axios automatically parses JSON, response.data contains the body
      return response.data;
    } catch (error) {
      // Logged by interceptor, re-throw to be handled by caller (Pinia store)
      console.error('Error in gameService.startGame:', error);
      throw error; // Re-throw the error so the calling action knows it failed
    }
  },

  // Add other game-related API calls here later
  // async submitGuess(gameId, roundData) { ... }
  // async getGameResults(gameId) { ... }
};