<template>
  <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
    <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Multiplayer Lobby</h1>
      <div v-if="multiplayerStore.gameCode" class="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg flex items-center">
        <span class="text-sm text-gray-700 dark:text-gray-300 mr-2">Game Code:</span>
        <span class="font-mono font-bold text-lg text-blue-600 dark:text-blue-400 tracking-wider">{{
          multiplayerStore.gameCode }}</span>
        <button @click="copyGameCode" title="Copy Game Code"
          class="ml-3 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Status & Error Display -->
    <div class="mb-4 p-3 rounded-md text-center" :class="connectionStatusClass">
      <p class="font-medium">{{ connectionStatusText }}</p>
    </div>
    <div v-if="multiplayerStore.error && !multiplayerStore.isConnected"
      class="mb-4 text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200 flex justify-between items-center">
      <span>Connection Error: {{ multiplayerStore.error }}</span>
      <button @click="multiplayerStore.connect()"
        class="ml-2 text-blue-600 text-sm underline font-medium">Retry</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Players List -->
      <div class="md:col-span-2">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[300px]">
          <h2 class="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Players ({{ multiplayerStore.players.length }} / ?) <!-- TODO: Get max players -->
          </h2>
          <div class="space-y-3">
            <!-- Player Item -->
            <div v-for="player in multiplayerStore.players" :key="player.userId"
              class="flex items-center justify-between bg-white dark:bg-gray-600 p-3 rounded-md shadow-sm"
              :class="{ 'ring-2 ring-blue-500': player.userId === authStore.userProfile?.id }">
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {{ player.username?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="ml-3 overflow-hidden">
                  <span class="font-medium text-gray-800 dark:text-white block truncate" :title="player.username">{{
                    player.username || 'Joining...' }}</span>
                  <span v-if="player.userId === authStore.userProfile?.id"
                    class="text-xs text-blue-600 dark:text-blue-400">(You)</span>
                  <span v-if="player.isHost" class="ml-1 text-xs text-yellow-600 dark:text-yellow-400 font-semibold">⭐
                    Host</span>
                </div>
              </div>
              <div class="flex items-center flex-shrink-0">
                <span v-if="player.isReady"
                  class="text-green-500 dark:text-green-400 flex items-center text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Ready
                </span>
                <span v-else class="text-gray-400 dark:text-gray-300 flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Not Ready
                </span>
              </div>
            </div>
            <div v-if="multiplayerStore.players.length === 0 && multiplayerStore.isConnected"
              class="text-center py-10 text-gray-500 dark:text-gray-400">
              Waiting for players... Share the code!
            </div>
          </div>
        </div>
      </div>

      <!-- Chat and Controls -->
      <div class="flex flex-col space-y-4">
        <!-- Chat -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex-grow flex flex-col">
          <h2 class="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Chat</h2>
          <div ref="chatBoxRef"
            class="h-64 overflow-y-auto mb-3 bg-white dark:bg-gray-600 rounded-md p-3 space-y-2 flex-grow">
            <!-- Chat Message -->
            <div v-for="(message, index) in multiplayerStore.chatMessages" :key="index" class="text-sm">
              <span class="font-semibold text-gray-700 dark:text-gray-300"
                :class="{ 'text-blue-600 dark:text-blue-400': message.userId === authStore.userProfile?.id }">{{
                  message.username || 'User' }}:</span>
              <span class="ml-1 text-gray-800 dark:text-white break-words">{{ message.content }}</span>
            </div>
            <div v-if="multiplayerStore.chatMessages.length === 0"
              class="text-gray-400 dark:text-gray-300 text-center italic py-10">
              No messages yet. Say hi!
            </div>
          </div>
          <div class="flex">
            <input v-model="chatInput" type="text" placeholder="Type a message..."
              class="flex-grow px-3 py-2 text-sm rounded-l-md border dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              @keyup.enter="handleSendChatMessage" :disabled="!multiplayerStore.isConnected" />
            <button @click="handleSendChatMessage" :disabled="!multiplayerStore.isConnected || !chatInput.trim()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Send
            </button>
          </div>
        </div>

        <!-- Controls -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="flex flex-col space-y-3">
            <button v-if="!multiplayerStore.isCurrentPlayerReady" @click="handleSetReady(true)"
              :disabled="!multiplayerStore.isConnected"
              class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium disabled:opacity-50">
              Mark as Ready
            </button>
            <button v-else @click="handleSetReady(false)" :disabled="!multiplayerStore.isConnected"
              class="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md font-medium disabled:opacity-50">
              Cancel Ready
            </button>

            <!-- Start Game Button (Explicit Checks) -->
            <button v-if="multiplayerStore.isHost" @click="handleStartGame" :disabled="!canStartGame"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Start Game
              <!-- Dynamic feedback message -->
              <span v-if="!multiplayerStore.isConnected"> (Disconnected)</span>
              <span v-else-if="multiplayerStore.players.length < 2"> (Waiting for more players...)</span>
              <!-- Adjust min players if needed -->
              <span v-else-if="!multiplayerStore.isEveryoneReady"> (Waiting for players to ready...)</span>
            </button>

            <button @click="handleLeaveGame"
              class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium">
              Leave Lobby
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy Confirmation -->
    <div v-if="showCopyConfirm"
      class="fixed bottom-5 right-5 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity duration-300"
      :class="showCopyConfirm ? 'opacity-100' : 'opacity-0'">
      Game Code Copied!
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useMultiplayerStore } from '../stores/MultiplayerStore';
import { useAuthStore } from '../stores/AuthStore'; // Need for current user ID

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const authStore = useAuthStore();
const chatInput = ref('');
const chatBoxRef = ref(null); // For auto-scrolling chat
const showCopyConfirm = ref(false);

const connectionStatusText = computed(() => {
  if (multiplayerStore.isConnected) return "Connected to Lobby";
  if (multiplayerStore.error && !multiplayerStore.isConnected) return "Connection Failed"; // Error shown below
  return "Connecting...";
});

const connectionStatusClass = computed(() => {
  if (multiplayerStore.isConnected) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (multiplayerStore.error && !multiplayerStore.isConnected) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 animate-pulse";
});

const canStartGame = computed(() => {
  // Must be connected
  if (!multiplayerStore.isConnected) return false;
  // Must be the host (redundant check as button isn't shown otherwise, but safe)
  if (!multiplayerStore.isHost) return false;
  // Must have enough players (e.g., minimum 2, adjust if allowing solo start for test)
  if (multiplayerStore.players.length < 1) return false; // Change to 2 for actual multiplayer
  // Everyone present must be ready
  return multiplayerStore.isEveryoneReady; // Use the existing computed property from store
});

function copyGameCode() {
  if (!multiplayerStore.gameCode) return;
  navigator.clipboard.writeText(multiplayerStore.gameCode)
    .then(() => {
      showCopyConfirm.value = true;
      setTimeout(() => { showCopyConfirm.value = false; }, 2000); // Hide after 2 seconds
    })
    .catch(err => {
      console.error('Failed to copy game code: ', err);
      // Optionally show an error message
    });
}

function handleSetReady(isReady) {
  multiplayerStore.setReady(isReady);
}

function handleSendChatMessage() {
  multiplayerStore.sendChatMessage(chatInput.value);
  chatInput.value = ''; // Clear input after sending
}

function handleStartGame() {
  if (canStartGame.value) { // Use the computed property
    console.log("Host clicking Start Game button...");
    multiplayerStore.hostStartGame(); // <<< CALL THE STORE ACTION
    // Navigation will happen automatically when 'game_start' is received
  } else {
    console.warn("Start game clicked but conditions not met.");
    multiplayerStore.error = "Cannot start game yet."; // Provide feedback
    setTimeout(() => { multiplayerStore.error = null }, 3000);
  }
}

function handleLeaveGame() {
  multiplayerStore.leaveGame(); // Disconnects and clears state
  router.push('/'); // Navigate home
}

// Auto-scroll chat
watch(() => multiplayerStore.chatMessages, async () => {
  await nextTick(); // Wait for DOM update
  const chatBox = chatBoxRef.value;
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}, { deep: true });


onMounted(() => {
  if (!multiplayerStore.gameCode || !multiplayerStore.gameId) {
    console.warn("Landed in lobby without game context, redirecting home.");
    router.push('/');
    return;
  }
  if (!multiplayerStore.isConnected) {
    multiplayerStore.connect();
  }
  // Scroll chat to bottom initially if messages already exist (e.g., reconnect)
  nextTick(() => {
    const chatBox = chatBoxRef.value;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
});

// Decide if you want to disconnect on component leave
onUnmounted(() => {
  // Typically, you DON'T disconnect just by leaving the lobby component view
  // unless the user explicitly clicked "Leave Game". The connection should persist
  // if they are just navigating within the app briefly.
  // If the user navigates completely away (e.g., back button to / ), the `leaveGame` action should be called.
  // Consider adding a global navigation guard (`router.beforeEach`) or using
  // `window.onbeforeunload` to prompt the user or automatically leave if they navigate away
  // from multiplayer sections without using the leave button.
});
</script>

<style scoped>
/* Simple scrollbar styling for chat */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>