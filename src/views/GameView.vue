<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">

    <!-- 1. Street View Background -->
    <div class="absolute inset-0 z-0">
      <StreetViewDisplay :location="gameStore.getCurrentLocation"
        v-if="gameStore.gameId && !gameStore.isGameOver && gameStore.getCurrentLocation" class="w-full h-full" />

      <div v-else-if="gameStore.gameId && !gameStore.isGameOver"
        class="w-full h-full bg-gray-700 flex items-center justify-center">
        <p class="text-gray-400 text-lg">Loading Location...</p>
      </div>
    </div>

    <!-- 2. Round Number (Top Center) -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-4 py-1.5 rounded-full text-lg font-semibold shadow-lg">
      Round {{ gameStore.currentRoundNumber }} / {{ gameStore.MAX_ROUNDS }}
    </div>

    <!-- 3. Map Overlay (Bottom Right - Expandable) -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver"
      class="map-container group absolute z-20 bottom-5 right-5 w-48 h-36 md:w-56 md:h-44 lg:w-64 lg:h-48 border-2 border-white/50 rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out hover:w-[40vw] hover:h-[40vh] hover:border-white"
      :class="{ 'pointer-events-none opacity-50': gameStore.hasSubmittedGuessForCurrentRound }">
      <MapDisplay @guess-made="handleMapGuess" ref="mapDisplayRef" :round-active="gameStore.isRoundActive"
        :submitted="gameStore.hasSubmittedGuessForCurrentRound"
        :actual-location="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentLocation : null"
        :guess-location="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentRoundResult?.guess : null"
        class="w-full h-full cursor-pointer" />

      <div
        class="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none group-focus-within:opacity-0">
        (Hover to enlarge)
      </div>
    </div>

    <!-- 4. Controls & Info (Bottom Center) -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver"
      class="controls-container absolute bottom-5 left-1/2 -translate-x-1/2 z-20 p-3 md:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center space-y-2">
      <p v-if="gameStore.currentGuess && !gameStore.hasSubmittedGuessForCurrentRound"
        class="text-xs text-gray-700 dark:text-gray-300">
        Selected: {{ gameStore.currentGuess.lat.toFixed(3) }}, {{ gameStore.currentGuess.lng.toFixed(3) }}
      </p>

      <div class="flex justify-center space-x-3">
        <button @click="submitGuessHandler"
          :disabled="!gameStore.currentGuess || !gameStore.isRoundActive || gameStore.hasSubmittedGuessForCurrentRound"
          class="px-4 py-2 md:px-5 bg-green-600 text-white rounded-md shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 transition duration-150 ease-in-out font-medium">
          {{ gameStore.hasSubmittedGuessForCurrentRound ? 'Guessed' : 'Guess' }}
        </button>
        <button v-if="gameStore.hasSubmittedGuessForCurrentRound && gameStore.currentRoundNumber < gameStore.MAX_ROUNDS"
          @click="nextRoundHandler"
          class="px-4 py-2 md:px-5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-150 ease-in-out font-medium">
          Next Round →
        </button>
        <button
          v-if="gameStore.hasSubmittedGuessForCurrentRound && gameStore.currentRoundNumber === gameStore.MAX_ROUNDS"
          @click="viewResultsHandler"
          class="px-4 py-2 md:px-5 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition duration-150 ease-in-out font-medium">
          Finish Game
        </button>
      </div>

      <div class="flex items-center justify-center space-x-4 pt-2 text-sm md:text-base">
        <div v-if="gameStore.hasSubmittedGuessForCurrentRound && gameStore.getCurrentRoundResult"
          class="text-center border-r pr-4 border-gray-300 dark:border-gray-600">
          <p class="text-xs text-gray-600 dark:text-gray-400">Round {{ gameStore.currentRoundNumber }} Score</p>
          <p class="font-semibold text-gray-800 dark:text-gray-200">{{ gameStore.getCurrentRoundResult.score }} pts</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">({{ gameStore.getCurrentRoundResult.distanceKm.toFixed(0)
            }} km)</p>

        </div>
        <div class="text-center">
          <p class="text-xs text-gray-600 dark:text-gray-400">Total Score</p>
          <p class="font-semibold text-gray-800 dark:text-gray-200">{{ gameStore.totalScore }}</p>
        </div>
      </div>
    </div>
    <div v-if="gameStore.gameError"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg text-center">
      <p class="font-bold mb-2">Error</p>
      <p>{{ gameStore.gameError }}</p>
      <button @click="gameStore.clearGameError()"
        class="mt-3 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
        Dismiss
      </button>
    </div>

    <!-- 5. Loading Overlay -->
    <div v-if="gameStore.isLoading && !gameStore.isGameOver"
      class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <svg class="animate-spin h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        {
      </svg>
      <p class="text-xl font-semibold text-white">Loading...</p>
    </div>

    <!-- 6. Start Game Button Screen (Before Game Starts) -->
    <div v-if="!gameStore.gameId && !gameStore.isGameOver"
      class="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center z-40">
      <h2 class="text-3xl font-bold text-white mb-6">Ready to Guess?</h2>
      <button @click="startGameHandler" :disabled="!gameStore.isMapsApiReady"
        class="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:bg-yellow-300 text-xl font-semibold transition duration-150 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105">
        {{ gameStore.isMapsApiReady ? 'Start New Game' : 'Initializing...' }}
      </button>
    </div>

    <!-- 7. Game Over Screen -->
    <div v-if="gameStore.isGameOver && gameStore.gameId"
      class="absolute inset-0 bg-gradient-to-br from-green-800 to-teal-800 flex flex-col items-center justify-center text-center p-6 z-40">
      <h2 class="text-5xl font-bold text-white mb-4 drop-shadow-lg">Game Over!</h2>
      <p class="text-2xl text-yellow-200 mb-2">Your final score:</p>
      <p class="text-6xl font-bold text-white mb-10 drop-shadow-md">{{ gameStore.totalScore }}</p>
      <button @click="startGameHandler"
        class="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:bg-yellow-300 text-xl font-semibold transition duration-150 ease-in-out transform hover:scale-105">
        Play Again?
      </button>
    </div>
    <!-- Modify Start Game Button Screen for errors too -->
    <div v-if="!gameStore.gameId && !gameStore.isGameOver"
      class="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center z-40">
      <h2 class="text-3xl font-bold text-white mb-6">Ready to Guess?</h2>
      <button @click="startGameHandler" :disabled="!gameStore.isMapsApiReady || gameStore.isLoading" 
        class="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:bg-yellow-300 text-xl font-semibold transition duration-150 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105">
        {{ !gameStore.isMapsApiReady ? 'Initializing...' : (gameStore.isLoading ? 'Starting...' : 'Start New Game') }}
      </button>
      <p v-if="gameError && !gameStore.gameId" class="mt-4 text-red-300">{{ gameError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import StreetViewDisplay from '../components/StreetViewDisplay.vue';
import MapDisplay from '../components/MapDisplay.vue';
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore();
const router = useRouter();
const mapDisplayRef = ref(null);

function startGameHandler() { gameStore.startGame(); }
function handleMapGuess(coordinates) { gameStore.recordGuess(coordinates); }
function submitGuessHandler() { gameStore.submitGuess(); }
function nextRoundHandler() {
  mapDisplayRef.value?.resetMapState(); // Ensure map clears markers/lines/zoom
  gameStore.nextRound();
}
function viewResultsHandler() {
  // For now, just shows the game over screen in place
  gameStore.isGameOver = true;
  console.log("Game finished. Final Score:", gameStore.totalScore);
}

// No changes needed to watchers or hooks for this layout change
watch(() => gameStore.currentRoundNumber, (newRound, oldRound) => { /* ... */ });
watch(() => gameStore.getCurrentLocation, (newLocation) => { /* ... */ });
onMounted(() => {
  console.log("GameView mounted (Full Screen Layout). Current store state:", {
    gameId: gameStore.gameId, round: gameStore.currentRoundNumber, isOver: gameStore.isGameOver
  });
});
</script>

<style scoped>
/* Ensure MapDisplay's internal map fills its container */
.map-container :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}

/* Optional: Add a subtle indicator for the map container */
.map-container::before {
  content: '';
  position: absolute;
  inset: -2px;
  /* Slightly outside border */
  border-radius: 0.6rem;
  /* Slightly larger than container's rounded-lg */
  border: 2px dashed transparent;
  transition: border-color 0.3s ease-in-out;
  pointer-events: none;
  /* Don't interfere with hover */
}

.map-container:hover::before {
  border-color: rgba(255, 255, 255, 0.7);
}

/* Ensure StreetView fills its absolute container */
/* StreetViewDisplay.vue should have w-full h-full on its root */
</style>