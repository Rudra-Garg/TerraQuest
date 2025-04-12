<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">

    <!-- 1. Street View Background -->
    <div class="absolute inset-0 z-0">
      <StreetViewDisplay :location="gameStore.getCurrentLocation"
        v-if="gameStore.gameId && !gameStore.isGameOver && gameStore.getCurrentLocation" class="w-full h-full" />

      <div v-else-if="gameStore.gameId && !gameStore.isGameOver"
        class="w-full h-full bg-gray-800 flex items-center justify-center">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <p class="text-gray-300 text-lg">Preparing your location...</p>
        </div>
      </div>
    </div>

    <!-- 2. Game Overlay UI (Static Elements) -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver && !isMapFullscreen"
      class="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <!-- Top Bar with Game Info -->
      <div class="flex justify-between items-center p-4 bg-gradient-to-b from-black/90 to-transparent">
        <div class="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg pointer-events-auto">
          <div class="text-yellow-400 text-sm font-medium">TOTAL SCORE</div>
          <div class="text-white text-xl font-bold">{{ gameStore.totalScore }}</div>
        </div>

        <div class="flex space-x-2 items-center">
          <!-- Round Indicator -->
          <div class="flex space-x-1">
            <div v-for="round in gameStore.MAX_ROUNDS" :key="round" :class="[
              'w-6 h-6 rounded-full flex items-center justify-center border-2',
              round < gameStore.currentRoundNumber ? 'bg-green-500 border-green-400' :
                round === gameStore.currentRoundNumber ? 'bg-blue-600 border-blue-500 animate-pulse' :
                  'bg-gray-700/70 border-gray-600'
            ]">
              <span class="text-xs font-bold text-white">{{ round }}</span>
            </div>
          </div>

          <!-- Time (could be implemented later) -->
          <div class="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-white font-mono text-lg">
            <!-- 02:45 -->
          </div>
        </div>

        <!-- Game Settings Button -->
        <button class="bg-black/70 p-2 rounded-lg hover:bg-black/90 transition-colors pointer-events-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 3. Map Overlay (Bottom Right - Expandable) -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver"
      class="map-container group absolute transition-all duration-300 ease-in-out border-2 overflow-hidden" :class="{
        'inset-0 z-40 border-none': isMapFullscreen || gameStore.hasSubmittedGuessForCurrentRound,
        'bottom-5 right-5 w-48 h-36 md:w-56 md:h-44 lg:w-64 lg:h-48 z-20 border-white/50 rounded-lg shadow-lg hover:w-[40vw] hover:h-[40vh] hover:border-white': !isMapFullscreen && !gameStore.hasSubmittedGuessForCurrentRound
      }">
      <MapDisplay @guess-made="handleMapGuess" ref="mapDisplayRef" :round-active="gameStore.isRoundActive"
        :submitted="gameStore.hasSubmittedGuessForCurrentRound"
        :actual-location="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentLocation : null"
        :guess-location="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentRoundResult?.guess : null"
        class="w-full h-full cursor-pointer" />

      <!-- Show hint only when map is NOT enlarged and not yet submitted -->
      <div v-if="!isMapFullscreen && !gameStore.hasSubmittedGuessForCurrentRound"
        class="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none group-focus-within:opacity-0">
        <span class="bg-black/80 px-2 py-1 rounded">Hover to enlarge</span>
      </div>

      <!-- Result overlay visible only after guess submission -->
      <div v-if="gameStore.hasSubmittedGuessForCurrentRound && gameStore.getCurrentRoundResult"
        class="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg text-sm max-w-xs shadow-lg">
        <div class="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="font-bold text-lg">Round {{ gameStore.currentRoundNumber }} Result</h3>
        </div>

        <div class="space-y-3">
          <div>
            <p class="text-gray-300 text-xs uppercase tracking-wide font-medium mb-1">Distance</p>
            <p class="font-semibold text-yellow-300 text-2xl">{{ gameStore.getCurrentRoundResult.distanceKm.toFixed(1)
            }} <span class="text-sm">km</span></p>
          </div>

          <div>
            <p class="text-gray-300 text-xs uppercase tracking-wide font-medium mb-1">Score</p>
            <p class="font-semibold text-green-300 text-2xl">{{ gameStore.getCurrentRoundResult.score }} <span
                class="text-sm">pts</span></p>
          </div>
        </div>

        <!-- Total score -->
        <div class="pt-3 mt-3 border-t border-gray-700">
          <p class="text-xs uppercase tracking-wide font-medium text-gray-300 mb-1">Total Score</p>
          <p class="font-bold text-2xl text-white">{{ gameStore.totalScore }} <span class="text-sm">pts</span></p>
        </div>
      </div>

      <!-- Fullscreen navigation controls after submission -->
      <div v-if="gameStore.hasSubmittedGuessForCurrentRound"
        class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <!-- Next round button -->
        <button v-if="gameStore.currentRoundNumber < gameStore.MAX_ROUNDS" @click="nextRoundHandler"
          class="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-all flex items-center">
          Next Round
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <!-- Finish game button -->
        <button v-else @click="viewResultsHandler"
          class="px-6 py-3 bg-purple-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-purple-700 transition-all flex items-center">
          Finish Game
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <!-- Close map button when expanded -->
      <button v-if="gameStore.hasSubmittedGuessForCurrentRound" @click="isMapFullscreen = false"
        class="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 4. Controls & Info (Bottom Center) -->
    <div
      v-if="gameStore.gameId && !gameStore.isGameOver && !(gameStore.hasSubmittedGuessForCurrentRound && isMapFullscreen)"
      class="controls-container absolute bottom-5 left-1/2 -translate-x-1/2 z-20 p-3 md:p-4 bg-black/80 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center space-y-2 border border-gray-700">
      <p v-if="gameStore.currentGuess && !gameStore.hasSubmittedGuessForCurrentRound" class="text-xs text-gray-300">
        Selected: {{ gameStore.currentGuess.lat.toFixed(3) }}°, {{ gameStore.currentGuess.lng.toFixed(3) }}°
      </p>

      <div class="flex justify-center space-x-3">
        <button @click="submitGuessHandler"
          :disabled="!gameStore.currentGuess || !gameStore.isRoundActive || gameStore.hasSubmittedGuessForCurrentRound"
          class="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-150 ease-in-out font-medium flex items-center">
          <svg v-if="!gameStore.currentGuess" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
      {{ gameStore.hasSubmittedGuessForCurrentRound ? "Guessed" : (gameStore.currentGuess ? "Submit Guess" : "Select a Location") }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="gameStore.gameError"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-xl text-center max-w-md">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-bold mb-1">Oops! Something went wrong</p>
          <p>{{ gameStore.gameError }}</p>
        </div>
      </div>
      <button @click="gameStore.clearGameError()"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
        Dismiss
      </button>
    </div>

    <!-- 5. Loading Overlay -->
    <div v-if="gameStore.isLoading && !gameStore.isGameOver"
      class="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
      <svg class="animate-spin h-16 w-16 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <p class="text-xl font-medium text-white">Preparing your adventure...</p>
      <p class="text-blue-300 mt-2 max-w-sm text-center">We're finding an interesting location for you to explore</p>
    </div>

    <!-- 6. Start Game Screen (Before Game Starts) -->
    <div v-if="!gameStore.gameId && !gameStore.isGameOver"
      class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center z-40 bg-[url('/path/to/world-map-bg.png')] bg-cover bg-center">
      <div class="bg-black/50 backdrop-blur-sm p-8 rounded-2xl text-center max-w-lg shadow-2xl border border-white/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-yellow-400 mx-auto mb-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-4xl font-bold text-white mb-3">TerraQuest Challenge</h2>
        <p class="text-lg text-blue-100 mb-8">Get ready to test your geography knowledge with 5 challenging locations
          from around the world!</p>
        <button @click="startGameHandler" :disabled="!gameStore.isMapsApiReady || gameStore.isLoading"
          class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 rounded-lg shadow-lg hover:from-yellow-400 hover:to-yellow-300 text-xl font-semibold transition-all duration-300 ease-in-out disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center w-full">
          <svg v-if="!gameStore.isMapsApiReady || gameStore.isLoading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ !gameStore.isMapsApiReady ? "Initializing Maps..." : (gameStore.isLoading ? "Starting Game..." : "Start Adventure") }}
        </button>
        <div class="flex items-center justify-center mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-blue-300">You'll have 5 rounds to guess different locations</p>
        </div>
        <p v-if="gameError && !gameStore.gameId" class="mt-4 text-red-300 bg-red-900/30 p-2 rounded">{{ gameError }}</p>
      </div>
    </div>

    <!-- 7. Game Over Screen -->
    <div v-if="gameStore.isGameOver && gameStore.gameId"
      class="absolute inset-0 bg-gradient-to-br from-green-800 via-blue-900 to-indigo-900 flex flex-col items-center justify-center text-center p-6 z-40">
      <div class="bg-black/30 backdrop-blur-sm p-8 rounded-2xl max-w-xl w-full border border-white/20 shadow-2xl">
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-yellow-900" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 border-4 border-indigo-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <h2 class="text-5xl font-bold text-white mb-4 drop-shadow-lg">Challenge Complete!</h2>
        <p class="text-xl text-blue-200 mb-6">Well played! Here's how you did:</p>

        <div class="bg-white/10 backdrop-blur rounded-lg p-5 mb-8">
          <div class="flex justify-center mb-3">
            <div class="px-6 py-3 bg-yellow-400/20 rounded-full">
              <p class="text-yellow-300 font-bold">FINAL SCORE</p>
              <p class="text-6xl font-bold text-white">{{ gameStore.totalScore }}</p>
            </div>
          </div>

          <!-- Round Results Summary (could be expanded) -->
          <div class="grid grid-cols-5 gap-2 mt-6">
            <div v-for="round in gameStore.MAX_ROUNDS" :key="round"
              class="flex flex-col items-center bg-white/10 p-2 rounded">
              <span class="text-xs text-white/70">Round {{ round }}</span>
              <span class="text-sm font-semibold text-white" v-if="gameStore.roundResults[round - 1]">
                {{ gameStore.roundResults[round - 1].score }}
              </span>
              <span v-else class="text-sm text-white/50">-</span>
            </div>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button @click="startGameHandler"
            class="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-green-600 font-semibold transition-all duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Play Again
          </button>
          <button @click="shareResults"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 font-semibold transition-all duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Results
          </button>
        </div>
      </div>
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
const isMapFullscreen = ref(false); // Renamed for clarity
const gameError = ref(null);

function startGameHandler() {
  gameStore.startGame();
}

function handleMapGuess(coordinates) {
  gameStore.recordGuess(coordinates);
}

function submitGuessHandler() {
  gameStore.submitGuess();
  // Automatically enlarge the map when submitting a guess
  isMapFullscreen.value = true;
}

function nextRoundHandler() {
  mapDisplayRef.value?.resetMapState(); // Ensure map clears markers/lines/zoom
  isMapFullscreen.value = false; // Reset map size for next round
  gameStore.nextRound();
}

function viewResultsHandler() {
  // For now, just shows the game over screen in place
  gameStore.isGameOver = true;
  console.log("Game finished. Final Score:", gameStore.totalScore);
}

function shareResults() {
  // Future implementation for sharing results
  alert("Share feature coming soon!");
}

watch(() => gameStore.currentRoundNumber, (newRound, oldRound) => {
  // Any special round transition animations could be triggered here
});

watch(() => gameStore.getCurrentLocation, (newLocation) => {
  // Any location-specific handling can be done here
});

onMounted(() => {
  console.log("GameView mounted (Full Screen Layout). Current store state:", {
    gameId: gameStore.gameId,
    round: gameStore.currentRoundNumber,
    isOver: gameStore.isGameOver
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
  border-radius: 0.6rem;
  border: 2px dashed transparent;
  transition: border-color 0.3s ease-in-out;
  pointer-events: none;
}

.map-container:hover::before {
  border-color: rgba(255, 255, 255, 0.5);
}

/* Ensure StreetView fills its absolute container */
/* StreetViewDisplay.vue should have w-full h-full on its root */

/* Animation for the pulse effect */
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }

  80%,
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.animate-pulse-ring::before {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 2px solid currentColor;
  animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}
</style>