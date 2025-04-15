<template>
  <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Multiplayer Lobby</h1>
      <div class="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
        <span class="text-sm text-gray-700 dark:text-gray-300">Game Code:</span>
        <span class="ml-2 font-mono font-bold text-blue-600 dark:text-blue-400">{{ multiplayerStore.gameCode }}</span>
        <button @click="copyGameCode" class="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Players List -->
      <div class="md:col-span-2">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Players ({{ multiplayerStore.players.length }})</h2>
          <div class="space-y-3">
            <div v-for="player in multiplayerStore.players" :key="player.userId" 
              class="flex items-center justify-between bg-white dark:bg-gray-600 p-3 rounded-md shadow-sm">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {{ player.username && player.username.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-3">
                  <span class="font-medium text-gray-800 dark:text-white">{{ player.username }}</span>
                  <span v-if="player.isHost" class="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Host</span>
                </div>
              </div>
              <div class="flex items-center">
                <span v-if="player.isReady" class="text-green-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Ready
                </span>
                <span v-else class="text-gray-400 dark:text-gray-300">Not Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat and Controls -->
      <div class="flex flex-col">
        <!-- Chat -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 flex-grow">
          <h2 class="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Chat</h2>
          <div class="h-64 overflow-y-auto mb-3 bg-white dark:bg-gray-600 rounded-md p-3">
            <div v-for="(message, index) in multiplayerStore.chatMessages" :key="index" class="mb-2">
              <div class="font-semibold text-sm text-gray-700 dark:text-gray-300">{{ message.username }}</div>
              <div class="text-gray-800 dark:text-white break-words">{{ message.content }}</div>
            </div>
            <div v-if="multiplayerStore.chatMessages.length === 0" class="text-gray-400 dark:text-gray-300 text-center italic">
              No messages yet
            </div>
          </div>
          <div class="flex">
            <input v-model="chatMessage" type="text" placeholder="Type a message..." 
              class="flex-grow px-3 py-2 rounded-l-md border dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
              @keyup.enter="sendChatMessage" />
            <button @click="sendChatMessage" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md">
              Send
            </button>
          </div>
        </div>

        <!-- Controls -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="flex flex-col space-y-3">
            <button v-if="!multiplayerStore.isCurrentPlayerReady" @click="setReady" 
              class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium">
              Ready Up
            </button>
            <button v-else @click="setNotReady" 
              class="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md font-medium">
              Cancel Ready
            </button>
            
            <button v-if="multiplayerStore.isHost && multiplayerStore.isEveryoneReady" 
              @click="startGame" 
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium">
              Start Game
            </button>
            
            <button @click="leaveGame" 
              class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium">
              Leave Game
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMultiplayerStore } from '../stores/MultiplayerStore';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const authStore = useAuthStore();
const chatMessage = ref('');

// Methods
function copyGameCode() {
  navigator.clipboard.writeText(multiplayerStore.gameCode);
  // Could add a toast notification here
}

function setReady() {
  multiplayerStore.setReady(true);
}

function setNotReady() {
  multiplayerStore.setReady(false);
}

function startGame() {
  multiplayerStore.startGame();
  router.push('/multiplayer/game');
}

function leaveGame() {
  multiplayerStore.leaveGame();
  router.push('/');
}

function sendChatMessage() {
  if (chatMessage.value.trim()) {
    multiplayerStore.sendChatMessage(chatMessage.value);
    chatMessage.value = '';
  }
}

// Cleanup on unmount
onUnmounted(() => {
  // Don't automatically leave the game when navigating to the game page
  // multiplayerStore.leaveGame();
});
</script> 