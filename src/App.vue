<template>
  <div id="app-container" class="min-h-screen">
    <nav class="bg-blue-600 p-4 text-white shadow-md z-30 relative">
      <div class="container mx-auto flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold hover:text-blue-200">TerraQuest</router-link>
        <div>
          <router-link to="/" class="mr-4 hover:text-blue-200">Home</router-link>
          <router-link to="/game" class="mr-4 hover:text-blue-200">New Game</router-link>
          <!-- Add Leaderboard Link Later -->
          <!-- <router-link to="/leaderboard" class="mr-4 hover:text-blue-200">Leaderboard</router-link> -->

          <!-- Conditional Auth Links -->
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/login" class="mr-4 hover:text-blue-200">Login</router-link>
            <router-link to="/register"
              class="bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300 text-sm font-semibold">
              Sign Up
            </router-link>
          </template>
          <template v-else>
            <span class="mr-4">Welcome, {{ authStore.userProfile?.username || 'User' }}!</span>
            {/* Add Profile Link Later */}
            {/* <router-link to="/profile" class="mr-4 hover:text-blue-200">Profile</router-link> */}
            <button @click="handleLogout"
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-semibold">
              Logout
            </button>
          </template>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGameStore } from './stores/GameStore'; // Import the store
import { useAuthStore } from './stores/authStore'; // Import the auth store
import { useRouter } from 'vue-router';

const gameStore = useGameStore(); // Get store instance
const authStore = useAuthStore(); // Get auth store instance
const router = useRouter();


// Function to load the Google Maps script
const loadGoogleMapsScript = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("VITE_GOOGLE_MAPS_API_KEY not found.");
    gameStore.setMapsApiReady(false); // Explicitly set to false on error
    return;
  }

  // Define the global callback function
  window.initMap = () => {
    console.log("Google Maps API loaded via dynamic script (Callback executed).");
    gameStore.setMapsApiReady(true); // <<< UPDATE STORE STATE
    // delete window.initMap; // Optional cleanup
  };

  // Check if script already exists
  if (document.getElementById('google-maps-script')) {
    // If script tag exists, check if API object is also ready
    if (window.google && window.google.maps) {
      if (!gameStore.isMapsApiReady) { // Update store if somehow missed callback
        gameStore.setMapsApiReady(true);
      }
    }
    return; // Don't add script again
  }

  const script = document.createElement('script');
  script.id = 'google-maps-script';
  // Use loading=async if supported, or just async/defer
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&loading=async`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    console.error("Failed to load Google Maps script.");
    gameStore.setMapsApiReady(false); // Set to false on load error
  };
  document.head.appendChild(script);
};

onMounted(() => {
  // Ensure store state reflects reality on mount, in case of hot reload etc.
  if (window.google && window.google.maps) {
    gameStore.setMapsApiReady(true);
  } else {
    loadGoogleMapsScript();
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login'); // Redirect after logout
};

onMounted(() => {
  // Initialize auth state (check localStorage)
  authStore.initializeAuth(); // <<< Initialize auth

  // Load Maps API
  if (window.google && window.google.maps) {
    gameStore.setMapsApiReady(true);
  } else {
    loadGoogleMapsScript();
  }
});
</script>

<style>
/* Global styles */
</style>