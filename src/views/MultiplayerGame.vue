<template>
  <div>
    <!-- Game view extends the existing game components with multiplayer-specific elements -->
    <div
      v-if="gameStore.isLoading"
      class="flex justify-center items-center h-96"
    >
      <div class="text-center">
        <svg
          class="animate-spin h-12 w-12 mx-auto text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-3 text-lg font-medium text-gray-700 dark:text-gray-300">
          Loading game...
        </p>
      </div>
    </div>

    <div v-else>
      <!-- Player indicator bar at top -->
      <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4 shadow-md">
        <div class="flex flex-wrap items-center justify-between">
          <div class="text-lg font-semibold text-gray-800 dark:text-white">
            Round {{ gameStore.currentRound }} of {{ gameStore.MAX_ROUNDS }}
          </div>

          <div class="flex space-x-3">
            <div
              v-for="player in multiplayerStore.players"
              :key="player.userId"
              class="flex items-center bg-white dark:bg-gray-700 px-3 py-1 rounded-md shadow-sm"
            >
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm"
              >
                {{ player.username && player.username.charAt(0).toUpperCase() }}
              </div>
              <div class="ml-2">
                <span
                  class="font-medium text-sm text-gray-800 dark:text-white"
                  >{{ player.username }}</span
                >
                <div class="text-xs">
                  <span
                    v-if="hasPlayerSubmittedGuess(player.userId)"
                    class="text-green-500"
                    >Guessed</span
                  >
                  <span v-else class="text-yellow-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Original game view - reuse existing components -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Map component from original game -->
        <div
          class="relative rounded-lg overflow-hidden h-[400px] lg:h-[600px] bg-gray-100 dark:bg-gray-700"
        >
          <!-- Replace with your actual map component -->
          <StreetViewDisplay v-if="gameStore.isRoundActive" />
          <div
            v-else-if="gameStore.isGameOver"
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h2 class="text-xl font-bold text-center mb-4">Game Over!</h2>
            <div class="max-w-3xl mx-auto">
              <MultiplayerResults />
            </div>
          </div>
          <div
            v-else-if="multiplayerStore.waitingForOtherPlayers"
            class="p-4 text-center"
          >
            <p class="text-lg font-medium mb-2">
              Waiting for other players to submit their guesses...
            </p>
            <svg
              class="animate-spin h-8 w-8 mx-auto text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <div v-else-if="gameStore.getCurrentRoundResult" class="p-4">
            <RoundResult
              :result="gameStore.getCurrentRoundResult"
              :showNextButton="true"
              @next-round="nextRound"
            />
          </div>
        </div>

        <!-- Guess map component from original game -->
        <div
          v-if="gameStore.isRoundActive"
          class="rounded-lg overflow-hidden h-[400px] lg:h-[600px] bg-gray-100 dark:bg-gray-700"
        >
          <MapDisplay 
            :roundActive="gameStore.isRoundActive"
            :submitted="gameStore.hasSubmittedGuessForCurrentRound"
            :actualLocation="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentRoundResult?.actual : null"
            :guessLocation="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentRoundResult?.guess : null"
            @guess-selected="handleGuess" />

          <!-- Submit controls -->
          <div class="flex justify-center mt-4">
            <button
              @click="submitMultiplayerGuess"
              :disabled="!gameStore.currentGuess"
              class="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Guess
            </button>
          </div>
        </div>
      </div>

      <!-- Chat/sidebar for multiplayer -->
      <div
        v-if="!gameStore.isGameOver"
        class="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
      >
        <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          Game Chat
        </h3>
        <div
          class="h-32 overflow-y-auto mb-2 bg-white dark:bg-gray-700 rounded-md p-2"
        >
          <div
            v-for="(message, index) in multiplayerStore.chatMessages"
            :key="index"
            class="mb-1"
          >
            <span class="font-semibold text-sm text-gray-700 dark:text-gray-300"
              >{{ message.username }}:</span
            >
            <span class="text-sm text-gray-800 dark:text-white ml-1">{{
              message.content
            }}</span>
          </div>
          <div
            v-if="multiplayerStore.chatMessages.length === 0"
            class="text-gray-400 text-center text-sm italic"
          >
            No messages yet
          </div>
        </div>
        <div class="flex">
          <input
            v-model="chatMessage"
            type="text"
            placeholder="Send a message..."
            class="flex-grow px-2 py-1 text-sm border rounded-l-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            @keyup.enter="sendChatMessage"
          />
          <button
            @click="sendChatMessage"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 rounded-r-md"
          >
            Send
          </button>
        </div>
      </div>

      <!-- Leave game button -->
      <div class="mt-4 text-center">
        <button
          @click="leaveGame"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Leave Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/GameStore';
import { useMultiplayerStore } from '../stores/MultiplayerStore';

// Import components with correct names
import StreetViewDisplay from '../components/StreetViewDisplay.vue';
import MapDisplay from '../components/MapDisplay.vue';
import RoundResult from '../components/RoundResult.vue';
import MultiplayerResults from '../components/MultiplayerResults.vue';

const router = useRouter();
const gameStore = useGameStore();
const multiplayerStore = useMultiplayerStore();
const chatMessage = ref('');

// Check if player has submitted a guess for the current round
function hasPlayerSubmittedGuess(userId) {
  return multiplayerStore.playerResults[userId] && 
         multiplayerStore.playerResults[userId][gameStore.currentRound - 1];
}

// Handle guess selection
function handleGuess(coords) {
  gameStore.recordGuess(coords);
}

// Submit guess and notify other players
function submitMultiplayerGuess() {
  multiplayerStore.submitGuess();
}

// Next round handler
function nextRound() {
  gameStore.nextRound();
}

// Send chat message
function sendChatMessage() {
  if (chatMessage.value.trim()) {
    multiplayerStore.sendChatMessage(chatMessage.value);
    chatMessage.value = '';
  }
}

// Leave game and return to home
function leaveGame() {
  multiplayerStore.leaveGame();
  router.push('/');
}

// Initialize game on component mount
onMounted(() => {
  // If no game ID is set, redirect to lobby
  if (!multiplayerStore.gameId) {
    router.push('/multiplayer/lobby');
  }
  
  // Start game if it's not already active
  if (!gameStore.isRoundActive && !gameStore.isGameOver) {
    gameStore.startGame();
  }
});
</script>
