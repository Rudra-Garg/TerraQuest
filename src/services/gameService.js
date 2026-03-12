import axios from "axios";
import { useAuthStore } from "../stores/AuthStore";
import router from "../router/index";

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  credentials: "include",
});

// ---------------------------------------------------------------------------
// Request interceptor – attach the Bearer token to every outgoing request.
// If the stored token is already expired, bail out early: log the user out
// and redirect to /login without even hitting the network.
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    // Proactive expiry check – avoid a round-trip we know will fail.
    if (authStore.isTokenExpired) {
      console.warn("gameService: stored token is expired. Logging out.");
      authStore.logout();
      router.push("/login");
      // Abort the request by returning a rejected promise.
      return Promise.reject(new Error("Token expired"));
    }

    const token = authStore.authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "Starting API Request:",
      config.method.toUpperCase(),
      config.url,
      config.params || "",
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Response interceptor – handle 401 Unauthorized responses reactively.
// This catches cases where the server rejects the token (expired, revoked,
// tampered, etc.) even if our local expiry check passed (e.g. clock skew).
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response Status:", response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    console.error(
      "API Response Error:",
      status,
      error.response?.data || error.message,
    );

    if (status === 401) {
      console.warn(
        "gameService: received 401 – token rejected by server. Logging out.",
      );
      const authStore = useAuthStore();
      authStore.logout();
      // Only redirect if we are not already on /login to avoid redirect loops.
      if (router.currentRoute.value.name !== "Login") {
        router.push("/login");
      }
    }

    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------
export default {
  /**
   * Starts a new game by fetching random locations from the backend.
   * @param {number} [rounds=5] - Number of rounds to request.
   * @returns {Promise<{ gameId: string, locations: Array<{ id: number, lat: number, lng: number }> }>}
   */
  async startGame(rounds = 5) {
    try {
      const response = await apiClient.get("/game/start", {
        params: { rounds },
      });
      return response.data;
    } catch (error) {
      console.error("Error in gameService.startGame:", error);
      throw error;
    }
  },

  /**
   * Submits the completed game results to the backend.
   * @param {object} gameResult
   * @param {number} gameResult.totalScore
   * @param {number} gameResult.roundsPlayed
   * @param {Array}  gameResult.rounds
   * @returns {Promise<object>}
   */
  async finishGame(gameResult) {
    try {
      const response = await apiClient.post("/game/finish", gameResult);
      return response.data;
    } catch (error) {
      console.error("Error in gameService.finishGame:", error);
      throw error;
    }
  },
};
