<template>
  <div id="app-container" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white shadow-lg z-30 relative">
      <div class="container mx-auto flex justify-between items-center">
        <router-link to="/"
          class="text-xl font-bold text-white hover:text-yellow-300 transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clip-rule="evenodd" />
          </svg>
          TerraQuest
        </router-link>
        <div class="flex items-center">
          <router-link to="/"
            class="mx-3 text-sm lg:text-base hover:text-yellow-300 transition-colors font-medium">Home</router-link>
          <router-link to="/game"
            class="mx-3 text-sm lg:text-base hover:text-yellow-300 transition-colors font-medium">New Game</router-link>
          <!-- Add Leaderboard Link Later -->
          <!-- <router-link to="/leaderboard" class="mx-3 text-sm lg:text-base hover:text-yellow-300 transition-colors font-medium">Leaderboard</router-link> -->

          <!-- Conditional Auth Links -->
          <div class="ml-4 flex items-center">
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login"
                class="mr-4 text-sm lg:text-base hover:text-yellow-300 transition-colors">Login</router-link>
              <router-link to="/register"
                class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all text-sm font-semibold">
                Sign Up
              </router-link>
            </template>
            <template v-else>
              <div class="relative group">
                <button class="mr-4 flex items-center text-sm lg:text-base hover:text-yellow-300 focus:outline-none">
                  <span class="mr-1">{{ authStore.userProfile?.username || 'User' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
                  onmouseleave="setTimeout(() => this.classList.remove('visible'), 200)">
                  <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your
                    Profile</router-link>
                  <button @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Sign out
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main class="container">
      <router-view />
    </main>

    <footer class="bg-gray-800 text-white mt-auto py-6">
      <div class="container mx-auto px-4 text-center">
        <p class="text-sm">© 2025 TerraQuest - Test your geography knowledge!</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGameStore } from './stores/GameStore'; // Import the store
import { useAuthStore } from './stores/AuthStore'; // Import the auth store
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #3B82F6;
  --secondary-color: #6366F1;
  --accent-color: #EAB308;
  --text-color: #1F2937;
  --bg-color: #F9FAFB;
}

body {
  font-family: 'Poppins', sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}

/* Smooth transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Button styling */
button.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

button.btn:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

button.btn-primary {
  background-color: #2563EB;
  color: white;
}

button.btn-primary:hover {
  background-color: #1D4ED8;
}

button.btn-secondary {
  background-color: #4F46E5;
  color: white;
}

button.btn-secondary:hover {
  background-color: #4338CA;
}

button.btn-accent {
  background-color: #EAB308;
  color: #1F2937;
}

button.btn-accent:hover {
  background-color: #FACC15;
}

button.btn-danger {
  background-color: #DC2626;
  color: white;
}

button.btn-danger:hover {
  background-color: #B91C1C;
}

/* Form styling */
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #D1D5DB;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  border-color: transparent;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}
</style>