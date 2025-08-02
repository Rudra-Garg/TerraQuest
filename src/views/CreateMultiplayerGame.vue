<template>
  <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h1 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Create Multiplayer Game</h1>

    <form @submit.prevent="handleCreateGame" class="space-y-6">
      <div>
        <label for="maxPlayers" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Max Players
        </label>
        <select
          v-model="maxPlayers"
          id="maxPlayers"
          class="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="2">2 Players</option>
          <option value="3">3 Players</option>
          <option value="4">4 Players</option>
          <option value="5">5 Players</option>
          <option value="6">6 Players</option>
          <option value="8">8 Players</option> <!-- Max from backend validation -->
        </select>
      </div>

      <div>
        <label for="roundsTotal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Number of Rounds
        </label>
        <select
          v-model="roundsTotal"
          id="roundsTotal"
          class="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="3">3 Rounds</option>
          <option value="5">5 Rounds</option>
          <option value="7">7 Rounds</option>
          <option value="10">10 Rounds</option> <!-- Max from backend validation -->
        </select>
      </div>

      <!-- Display API errors -->
      <div v-if="multiplayerStore.error" class="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
        {{ multiplayerStore.error }}
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 flex justify-center items-center"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="isLoading">Creating...</span>
        <span v-else>Create Game</span>
      </button>
    </form>

    <div class="mt-4 text-center">
      <router-link to="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMultiplayerStore } from '../stores/MultiplayerStore';

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const maxPlayers = ref(4);
const roundsTotal = ref(5);
const isLoading = ref(false);

async function handleCreateGame() {
  isLoading.value = true;
  const success = await multiplayerStore.createGame({
    maxPlayers: parseInt(maxPlayers.value),
    roundsTotal: parseInt(roundsTotal.value)
  });

  if (success) {
    router.push('/multiplayer/lobby'); // Navigate to lobby on success
  }
  // Error is handled by displaying multiplayerStore.error
  isLoading.value = false;
}
</script>