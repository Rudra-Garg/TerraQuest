// src/stores/AuthStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import authService from "../services/authService";

// ---------------------------------------------------------------------------
// Helper: decode the payload of a JWT without any external library.
// Returns null if the token is malformed.
// ---------------------------------------------------------------------------
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    // Convert base64url → base64
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // Pad to a multiple of 4 chars
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const token = ref(localStorage.getItem("authToken") || null);
  const user = ref(JSON.parse(localStorage.getItem("authUser") || "null"));
  const authError = ref(null);
  const isLoading = ref(false);
  const profile = ref(null);
  const profileHistory = ref([]);

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  /**
   * True when the stored token's `exp` claim is in the past (or the token
   * cannot be decoded). Returns false (not expired) when there is no token at
   * all so callers can distinguish "no token" from "expired token".
   */
  const isTokenExpired = computed(() => {
    if (!token.value) return false; // No token → not "expired", just absent
    const payload = parseJwt(token.value);
    if (!payload || typeof payload.exp !== "number") {
      // Cannot decode or no exp claim → treat as expired for safety
      return true;
    }
    // payload.exp is in seconds; Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  });

  /**
   * The user is considered authenticated only when:
   *  - A token exists in state
   *  - User data exists in state
   *  - The token has NOT expired
   */
  const isAuthenticated = computed(
    () => !!token.value && !!user.value && !isTokenExpired.value,
  );

  const userProfile = computed(() => profile.value || user.value);
  const authToken = computed(() => token.value);

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------
  function setToken(newToken) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  function setUser(newUser) {
    user.value = newUser;
    if (newUser) {
      localStorage.setItem("authUser", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("authUser");
    }
  }

  function setProfile(newProfile) {
    profile.value = newProfile;
    if (newProfile) {
      setUser({
        ...(user.value || {}),
        ...newProfile,
      });
    }
  }

  function setProfileHistory(history) {
    profileHistory.value = Array.isArray(history) ? history : [];
  }

  function setError(errorMessage) {
    authError.value = errorMessage;
  }

  function clearError() {
    authError.value = null;
  }

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  async function register(userData) {
    isLoading.value = true;
    clearError();
    try {
      const response = await authService.register(userData);
      console.log("Registration Response:", response);
      isLoading.value = false;
      return { success: true, data: response };
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error?.error || "Registration failed. Please try again.");
      isLoading.value = false;
      return { success: false };
    }
  }

  async function login(credentials) {
    isLoading.value = true;
    clearError();
    try {
      const response = await authService.login(credentials);
      if (!response.token || !response.user) {
        throw new Error("Invalid response from server during login.");
      }
      setToken(response.token);
      setUser(response.user);
      await fetchProfile();
      isLoading.value = false;
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setError(error?.error || "Login failed. Please check your credentials.");
      setToken(null);
      setUser(null);
      setProfile(null);
      setProfileHistory([]);
      isLoading.value = false;
      return false;
    }
  }

  function logout() {
    console.log("Logging out...");
    setToken(null);
    setUser(null);
    setProfile(null);
    setProfileHistory([]);
    clearError();
  }

  /**
   * Called once on app startup (e.g. in App.vue's onMounted / main.js).
   * Clears any stale / expired token so the rest of the app never sees a
   * zombie authenticated state.
   */
  async function initializeAuth() {
    if (!token.value) {
      // Nothing stored – make sure user data is also gone.
      setUser(null);
      setProfile(null);
      setProfileHistory([]);
      return;
    }

    if (isTokenExpired.value) {
      console.warn("Stored token is expired. Clearing auth state.");
      logout();
      return;
    }

    // Token is present and still valid.
    if (!user.value) {
      // Edge-case: token exists but user data was lost from storage.
      // For now just log; a future improvement could fetch the profile.
      console.warn(
        "Token exists but no user data found. Auth state may be incomplete.",
      );
    }

    await fetchProfile();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  async function resetPassword(payload) {
    isLoading.value = true;
    clearError();
    try {
      const response = await authService.resetPassword(payload);
      isLoading.value = false;
      return { success: true, data: response };
    } catch (error) {
      console.error("Password reset failed:", error);
      setError(
        error?.error || "Password reset failed. Please verify your details.",
      );
      isLoading.value = false;
      return { success: false };
    }
  }

  async function fetchProfile() {
    if (!token.value) return null;

    try {
      const [profileResponse, historyResponse] = await Promise.all([
        authService.getProfile(token.value),
        authService.getGameHistory(token.value),
      ]);

      if (profileResponse) {
        setProfile(profileResponse);
      }

      if (historyResponse?.games) {
        setProfileHistory(historyResponse.games);
      } else {
        setProfileHistory([]);
      }

      return {
        user: profileResponse || null,
        recentGames: historyResponse?.games || [],
      };
    } catch (error) {
      console.error("Fetching profile failed:", error);
      return null;
    }
  }

  return {
    // State
    token,
    user,
    authError,
    isLoading,
    profile,
    profileHistory,
    // Getters
    isAuthenticated,
    isTokenExpired,
    userProfile,
    authToken,
    // Actions
    register,
    login,
    logout,
    resetPassword,
    fetchProfile,
    setError,
    clearError,
    initializeAuth,
  };
});
