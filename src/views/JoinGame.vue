<template>
  <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h1 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Join Multiplayer Game</h1>

    <form @submit.prevent="handleJoinGame" class="space-y-4">
      <div>
        <label for="gameCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Game Code</label>
        <input
          v-model="inputGameCode"
          id="gameCode"
          type="text"
          maxlength="6"
          placeholder="Enter 6-character code"
          class="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase font-mono tracking-widest"
          required
        />
      </div>

      <!-- Display API errors -->
      <div v-if="multiplayerStore.error" class="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
        {{ multiplayerStore.error }}
      </div>

      <button
        type="submit"
        :disabled="isLoading || !inputGameCode"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 flex justify-center items-center"
      >
         <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="isLoading">Joining...</span>
        <span v-else>Join Game</span>
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
const inputGameCode = ref('');
const isLoading = ref(false);

async function handleJoinGame() {
  if (!inputGameCode.value) return;

  isLoading.value = true;
  const codeToJoin = inputGameCode.value.toUpperCase(); // Normalize
  const success = await multiplayerStore.joinGame(codeToJoin);

  if (success) {
    router.push('/multiplayer/lobby');
  }
  // Error is handled by displaying multiplayerStore.error
  isLoading.value = false;
}
</script>