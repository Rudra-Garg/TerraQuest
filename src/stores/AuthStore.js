// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/authService'; // Adjust path if needed

export const useAuthStore = defineStore('auth', () => {
    // --- State ---
    const token = ref(localStorage.getItem('authToken') || null); // Load token from storage on init
    const user = ref(JSON.parse(localStorage.getItem('authUser') || 'null')); // Load user info
    const authError = ref(null);
    const isLoading = ref(false);

    // --- Getters ---
    const isAuthenticated = computed(() => !!token.value && !!user.value); // Simple check
    const userProfile = computed(() => user.value);
    const authToken = computed(() => token.value); // Getter for the token

    // --- Actions ---
    function setToken(newToken) {
        token.value = newToken;
        if (newToken) {
            localStorage.setItem('authToken', newToken);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    function setUser(newUser) {
        user.value = newUser;
        if (newUser) {
            localStorage.setItem('authUser', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('authUser');
        }
    }

    function setError(errorMessage) {
        authError.value = errorMessage;
    }

    function clearError() {
        authError.value = null;
    }

    async function register(userData) {
        isLoading.value = true;
        clearError();
        try {
            const response = await authService.register(userData);
            console.log('Registration Response:', response);
            // Registration successful, but don't log in automatically here
            // Let the user log in manually for now
            isLoading.value = false;
            return true; // Indicate success
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error?.error || 'Registration failed. Please try again.'); // Use error from backend if available
            isLoading.value = false;
            return false; // Indicate failure
        }
    }

    async function login(credentials) {
        isLoading.value = true;
        clearError();
        try {
            const response = await authService.login(credentials);
            // console.log('Login Response:', response);
            if (!response.token || !response.user) {
                throw new Error("Invalid response from server during login.");
            }
            setToken(response.token);
            setUser(response.user); // Store basic user info returned from login
            isLoading.value = false;
            return true; // Indicate success
        } catch (error) {
            console.error('Login failed:', error);
            setError(error?.error || 'Login failed. Please check your credentials.'); // Use error from backend if available
            setToken(null); // Clear any stale token/user
            setUser(null);
            isLoading.value = false;
            return false; // Indicate failure
        }
    }

    function logout() {
        console.log('Logging out...');
        setToken(null);
        setUser(null);
        clearError();
        // Optionally redirect using router instance if needed, or handle in component
        // router.push('/login');
    }

    // Optional: Action to potentially refresh user data if token exists on app load
    async function initializeAuth() {
        if (token.value && !user.value) {
            console.log("Token exists but no user data, consider fetching profile...");
            // Here you might add an API call to fetch the user profile using the token
            // e.g., const profile = await userService.getProfile(); setUser(profile);
            // For now, we rely on the data stored during login.
        } else if (!token.value) {
            // Clear user data if token is missing
            setUser(null);
        }
    }


    return {
        // State
        token,
        user,
        authError,
        isLoading,
        // Getters
        isAuthenticated,
        userProfile,
        authToken,
        // Actions
        register,
        login,
        logout,
        setError, // Expose setError for direct use in components if needed
        clearError,
        initializeAuth,
    };
});