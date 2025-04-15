<template>
  <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h1 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Join Multiplayer Game</h1>
    
    <form @submit.prevent="joinGame" class="space-y-4">
      <div>
        <label for="gameCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Game Code</label>
        <input
          v-model="gameCode"
          id="gameCode"
          type="text"
          placeholder="Enter game code"
          class="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>
      
      <div v-if="multiplayerStore.error" class="text-red-500 text-sm">{{ multiplayerStore.error }}</div>
      
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
      >
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
const gameCode = ref('');
const isLoading = ref(false);

async function joinGame() {
  if (!gameCode.value) return;
  
  isLoading.value = true;
  
  try {
    await multiplayerStore.joinGame(gameCode.value);
    router.push('/multiplayer/lobby');
  } catch (err) {
    // Error is already stored in multiplayerStore.error
  } finally {
    isLoading.value = false;
  }
}
</script> 