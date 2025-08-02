<template><!-- 1. Root Container -->
  <div class="relative w-full max-w-screen-2xl mx-auto h-screen overflow-hidden bg-black">

    <!-- 2. Street View Background -->
    <div class="absolute inset-0 z-0">
      <StreetViewDisplay v-if="currentLocation && !gameStore.isGameOver"
        :key="`${gameStore.currentRoundNumber}-${currentLocation?.lat}-${currentLocation?.lng}`"
        :location="currentLocation" class="w-full h-full" />
      <!-- ... (loading/waiting for game start placeholders remain the same) ... -->
      <div v-else-if="!currentLocation && gameStore.gameId && !gameStore.isGameOver && gameStore.currentRoundNumber > 0"
        class="w-full h-full bg-gray-800 flex items-center justify-center text-gray-300">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <p class="text-lg">Loading Round {{ gameStore.currentRoundNumber }} Location...</p>
        </div>
      </div>
      <div v-else-if="!gameStore.gameId || gameStore.currentRoundNumber === 0"
        class="w-full h-full bg-gray-800 flex items-center justify-center text-gray-300">
        Waiting for game to start...
      </div>
    </div>

    <!-- 3. Top Info Bar -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver && !isMapFullscreen"
      class="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div
        class="flex flex-wrap justify-between items-center p-4 bg-gradient-to-b from-black/90 to-transparent gap-4 max-w-screen-2xl mx-auto">
        <div class="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg pointer-events-auto">
          <div class="text-yellow-400 text-sm font-medium uppercase">Your Score</div>
          <div class="text-white text-xl font-bold">{{ getCurrentUserSession?.totalScore ?? 0 }}</div>
        </div>

        <div
          v-if="isRoundTimerActive && roundTimeRemaining > 0 && !multiplayerStore.isWaitingForRoundEnd && !showRoundResults"
          class="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg pointer-events-auto text-center">
          <div v-if="!multiplayerStore.firstPlayerGuessedInRound && gameStore.isRoundActive"
            class="text-yellow-400 text-sm font-medium uppercase">WAITING FOR FIRST GUESS</div>
          <div v-else-if="roundTimeRemaining > 0" class="text-red-400 text-sm font-medium uppercase">TIME LEFT</div>

          <div class="text-white text-2xl font-mono font-bold tracking-wider"
            :class="{ 'animate-pulse !text-red-500': roundTimeRemaining <= 10 && roundTimeRemaining > 0 }">
            {{ formatTime(roundTimeRemaining) }}
          </div>
        </div>

        <div class="flex space-x-1 items-center pointer-events-auto">
          <div v-for="round in gameStore.MAX_ROUNDS" :key="round" :class="[
            'w-6 h-6 rounded-full flex items-center justify-center border-2',
            round < gameStore.currentRoundNumber ? 'bg-green-500 border-green-400' :
              round === gameStore.currentRoundNumber ? 'bg-blue-600 border-blue-500 animate-pulse' :
                'bg-gray-700/70 border-gray-600'
          ]">
            <span class="text-xs font-bold text-white">{{ round }}</span>
          </div>
        </div>
        <div class="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg pointer-events-auto">
          <div class="text-blue-300 text-sm font-medium uppercase">Game Code</div>
          <div class="text-white text-lg font-mono font-bold tracking-wider">{{ multiplayerStore.gameCode }}</div>
        </div>

        <!-- Game Settings Button -->
        <div class="relative">
          <button @click="toggleSettings"
            class="bg-black/70 p-2 rounded-lg hover:bg-black/90 transition-colors pointer-events-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button> <!-- Settings Dropdown -->
          <div v-if="showSettings"
            class="absolute top-12 right-0 bg-black/90 backdrop-blur-sm rounded-lg shadow-xl p-4 min-w-[200px] z-50 pointer-events-auto">
            <h3 class="text-white text-sm font-semibold mb-3">Map Settings</h3>
            <div class="space-y-2">
              <label class="flex items-center text-white text-sm cursor-pointer" @click.stop>
                <input type="checkbox" v-model="mapSettings.showCoordinates" class="mr-2 rounded cursor-pointer"
                  @click.stop>
                Show Coordinates
              </label>
              <label class="flex items-center text-white text-sm cursor-pointer" @click.stop>
                <input type="checkbox" v-model="mapSettings.enableZoom" class="mr-2 rounded cursor-pointer" @click.stop>
                Enable Zoom
              </label>
              <label class="flex items-center text-white text-sm cursor-pointer" @click.stop>
                <input type="checkbox" v-model="mapSettings.darkMode" class="mr-2 rounded cursor-pointer" @click.stop>
                Dark Map Theme
              </label>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- 4. Player Status Bar -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver && !isMapFullscreen"
      class="absolute top-[80px] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl xl:max-w-5xl z-10 pointer-events-auto">
      <div class="player-status-bar bg-black/75 backdrop-blur-md p-3 rounded-lg shadow-md">
        <div class="flex flex-wrap gap-x-4 gap-y-2 justify-center">
          <div v-for="player in multiplayerStore.players" :key="player.userId"
            class="flex items-center px-3 py-1.5 rounded-md text-sm whitespace-nowrap"
            :class="getPlayerStatusClass(player)">
            <span class="font-semibold mr-2 truncate max-w-[120px]" :title="player.username">{{ player.username
            }}</span>
            <span class="text-xs opacity-80">({{ player.currentHealth }}HP)</span>
            <svg v-if="hasPlayerSubmittedGuessThisRound(player.userId)" class="h-3 w-3 text-green-400 ml-1"
              fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
            <svg
              v-else-if="gameStore.isRoundActive && player.status === 'active' && !multiplayerStore.isWaitingForRoundEnd && !showRoundResults"
              class="h-3 w-3 text-yellow-400 animate-pulse ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div> <!-- 5. Map Overlay Container -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver"
      class="map-container group absolute transition-all duration-500 ease-in-out border-2 overflow-hidden" :class="{
        'inset-0 z-40 border-none rounded-none': isMapFullscreen || showRoundResults,
        'bottom-5 right-5 w-48 h-36 md:w-56 md:h-44 lg:w-64 lg:h-48 z-20 border-white/50 rounded-lg shadow-xl hover:w-[40vw] hover:h-[40vh] hover:border-white hover:z-30': !isMapFullscreen && !showRoundResults
      }">
      <MapDisplay @guess-made="handleMapGuess" ref="mapDisplayRef" :key="`map-${gameStore.currentRoundNumber}`"
        :round-active="gameStore.isRoundActive && !multiplayerStore.isWaitingForRoundEnd && !showRoundResults"
        :submitted="showRoundResults"
        :actual-location="showRoundResults ? multiplayerStore.currentRoundActualLocation : null"
        :guess-location="showRoundResults ? getCurrentUserRoundResult?.guess : null"
        class="w-full h-full cursor-pointer" />

      <div v-if="showRoundResults"
        class="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg text-sm max-w-xs shadow-lg z-50">
        <div class="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="font-bold text-lg">Round {{ gameStore.currentRoundNumber }} Result</h3>
        </div>
        <div class="space-y-1 mb-2">
          <p class="text-xs text-gray-400">Winner: <span class="font-semibold text-green-400">{{ roundWinnerUsername
              }}</span> ({{ roundWinnerScore }} pts)</p>
          <p class="text-xs text-gray-400">Damage Multiplier: {{ multiplayerStore.currentRoundMultiplier.toFixed(1) }}x
          </p>
        </div>
        <div class="space-y-3 max-h-48 overflow-y-auto pr-2">
          <div v-for="playerResult in detailedPlayerResultsForCurrentRound" :key="playerResult.userId"
            class="border-b border-gray-700 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
            <p class="font-semibold text-sm"
              :class="{ 'text-blue-300': playerResult.userId === authStore.userProfile?.id }">{{ playerResult.username
              }}
            </p>
            <p class="text-xs">Score: <span class="font-medium text-green-300">{{ playerResult.roundScore }} pts</span>
            </p>
            <p class="text-xs">Distance: <span class="font-medium">{{ playerResult.distanceKm < 0 ? 'N/A' :
              playerResult.distanceKm.toFixed(1) + ' km' }}</span>
            </p>
            <p class="text-xs">Damage: <span class="font-medium text-red-400">{{ playerResult.damageTaken }}</span></p>
            <p class="text-xs">Health: <span class="font-medium">{{ playerResult.currentHealth }} / {{
              multiplayerStore.initialHealth }}</span></p>
          </div>
        </div>
      </div>

      <div v-if="showRoundResults" class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button v-if="multiplayerStore.isHost" @click="handleHostProceed" :disabled="!multiplayerStore.isHost" class="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700
          transition-all flex items-center disabled:opacity-60 disabled:cursor-not-allowed">
          {{ isLastRound ? 'View Final Results' : 'Next Round' }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="isLastRound ? 'M5 13l4 4L19 7' : 'M13 7l5 5m0 0l-5 5m5-5H6'" />
          </svg>
        </button>
        <div v-if="!multiplayerStore.isHost && showRoundResults && !gameStore.isGameOver"
          class="text-white text-sm p-3 bg-black/70 rounded-lg">
          Waiting for host to start next round...</div>
      </div>

      <div v-if="multiplayerStore.isWaitingForRoundEnd && !showRoundResults"
        class="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white p-4 text-center">
        <svg class="animate-spin h-8 w-8 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <p class="text-lg font-medium">Your guess is submitted!</p>
        <p class="text-sm mt-1">Waiting for other players or timer to finish...</p>
      </div>
    </div>

    <!-- 6. Bottom Controls -->
    <div
      v-if="gameStore.gameId && !gameStore.isGameOver && !isMapFullscreen && !multiplayerStore.isWaitingForRoundEnd && !showRoundResults"
      class="controls-container absolute bottom-5 left-1/2 -translate-x-1/2 z-30 p-3 md:p-4 bg-black/80 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center space-y-2 border border-gray-700">
      <p v-if="gameStore.currentGuess" class="text-xs text-gray-300 mb-1">
        Selected: {{ gameStore.currentGuess.lat.toFixed(3) }}°, {{ gameStore.currentGuess.lng.toFixed(3) }}°
      </p>
      <button @click="submitGuessHandler"
        :disabled="!gameStore.currentGuess || !gameStore.isRoundActive || multiplayerStore.isWaitingForRoundEnd || showRoundResults"
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
        {{ gameStore.currentGuess ? "Submit Guess" : "Select a Location" }}
      </button>
    </div>

    <!-- 7. Game Over Screen -->
    <div v-if="gameStore.isGameOver && multiplayerStore.gameId"
      class="absolute inset-0 bg-gradient-to-br from-green-800 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 sm:p-6 z-50">
      <MultiplayerResults />
    </div>

    <!-- Error Message Display -->
    <div v-if="multiplayerStore.error"
      class="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-3 rounded-lg shadow-xl text-center max-w-md">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-bold mb-1">Error</p>
          <p>{{ multiplayerStore.error }}</p>
        </div>
      </div>
      <button @click="multiplayerStore.error = null"
        class="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors">Dismiss</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/GameStore';
import { useMultiplayerStore } from '../stores/MultiplayerStore';
import { useAuthStore } from '../stores/AuthStore';
import StreetViewDisplay from '../components/StreetViewDisplay.vue';
import MapDisplay from '../components/MapDisplay.vue';
import MultiplayerResults from '../components/MultiplayerResults.vue';

const router = useRouter();
const gameStore = useGameStore();
const multiplayerStore = useMultiplayerStore();
const authStore = useAuthStore();
const mapDisplayRef = ref(null);
const isMapFullscreen = ref(false);

const showSettings = ref(false);
const mapSettings = ref({
  showCoordinates: false,
  enableZoom: true,
  darkMode: false
});

// Watch for settings changes and apply them to the map
watch(() => mapSettings.value, (newSettings) => {
  if (mapDisplayRef.value) {
    mapDisplayRef.value.updateMapSettings(newSettings);
  }
}, { deep: true });

// --- Timer State ---
const roundTimeRemaining = ref(0);
const isRoundTimerActive = ref(false);
let roundTimerInterval = null;

// --- Computed Properties ---
const showRoundResults = computed(() => multiplayerStore.showRoundResultsSummary);
const isLastRound = computed(() => gameStore.currentRoundNumber >= gameStore.MAX_ROUNDS);
const currentLocation = computed(() => gameStore.getCurrentLocation);
const getCurrentUserSession = computed(() => {
  const currentUserId = authStore.userProfile?.id;
  return currentUserId ? multiplayerStore.players.find(p => p.userId === currentUserId) : null;
});
const getCurrentUserRoundResult = computed(() => {
  const currentRoundNum = gameStore.currentRoundNumber;
  const userId = authStore.userProfile?.id;
  if (!userId || currentRoundNum <= 0 || !multiplayerStore.playerRoundResults[userId]) return null;
  return multiplayerStore.playerRoundResults[userId][currentRoundNum - 1] || null;
});

const detailedPlayerResultsForCurrentRound = computed(() => {
  if (!showRoundResults.value) return [];
  const currentRoundNum = gameStore.currentRoundNumber;
  return multiplayerStore.players
    .map(player => {
      const result = multiplayerStore.playerRoundResults[player.userId]?.[currentRoundNum - 1];
      return {
        userId: player.userId,
        username: player.username,
        roundScore: result?.score ?? 0,
        distanceKm: result?.distanceKm ?? -1,
        damageTaken: result?.damageTaken ?? 0,
        currentHealth: player.currentHealth,
        status: player.status,
      };
    })
    .sort((a, b) => b.roundScore - a.roundScore);
});

const roundWinnerUsername = computed(() => {
  if (!showRoundResults.value || !multiplayerStore.currentRoundWinnerId) return "N/A";
  const winner = multiplayerStore.players.find(p => p.userId === multiplayerStore.currentRoundWinnerId);
  return winner?.username || "Unknown";
});
const roundWinnerScore = computed(() => {
  if (!showRoundResults.value || !multiplayerStore.currentRoundWinnerId) return 0;
  const winnerResult = detailedPlayerResultsForCurrentRound.value.find(p => p.userId === multiplayerStore.currentRoundWinnerId);
  return winnerResult?.roundScore || 0;
});


// --- Methods ---
function handleMapGuess(coordinates) {
  if (!gameStore.isRoundActive || multiplayerStore.isWaitingForRoundEnd || showRoundResults.value) return;
  gameStore.recordGuess(coordinates);
}

function submitGuessHandler() {
  if (!gameStore.currentGuess || !gameStore.isRoundActive || multiplayerStore.isWaitingForRoundEnd || showRoundResults.value) return;
  multiplayerStore.submitGuess();
}

function handleHostProceed() {
  if (!multiplayerStore.isHost) {
    console.warn("Non-host attempted to control round progression.");
    return;
  }
  console.log("Host action: handleHostProceed. Is last round:", isLastRound.value);
  multiplayerStore.hostProceedToNextRound();
  // UI changes (hiding results, map reset) will be triggered by server's 'round_start' or 'game_end'
}


function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function startRoundTimer(duration) {
  console.log(`MultiplayerGame: startRoundTimer called with duration ${duration}. isRoundTimerActive: ${isRoundTimerActive.value}`);
  if (roundTimerInterval) clearInterval(roundTimerInterval);

  roundTimeRemaining.value = duration;
  if (duration > 0 && isRoundTimerActive.value) {
    roundTimerInterval = setInterval(() => {
      if (!isRoundTimerActive.value) { clearInterval(roundTimerInterval); return; }
      roundTimeRemaining.value--;
      if (roundTimeRemaining.value <= 0) {
        clearInterval(roundTimerInterval);
        roundTimerInterval = null;
      }
    }, 1000);
  }
}

function hasPlayerSubmittedGuessThisRound(userId) {
  const currentRoundNum = gameStore.currentRoundNumber;
  if (currentRoundNum <= 0) return false;
  const playerResultsForRound = multiplayerStore.playerRoundResults[userId];
  return playerResultsForRound?.[currentRoundNum - 1]?.guess !== undefined;
}

function getPlayerStatusClass(player) {
  if (player.status === 'eliminated') return 'bg-red-700/30 text-red-300 opacity-70 line-through';
  if (player.status === 'disconnected' || player.status === 'disconnected_ws') return 'bg-gray-600/30 text-gray-400 opacity-80';

  if (multiplayerStore.isWaitingForRoundEnd || showRoundResults.value) {
    return hasPlayerSubmittedGuessThisRound(player.userId) ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300';
  }
  return gameStore.isRoundActive ? 'bg-yellow-500/30 text-yellow-300' : 'bg-gray-500/30 text-gray-300';
}

function toggleSettings() {
  showSettings.value = !showSettings.value;
}


// --- Lifecycle and Watchers ---
onMounted(() => {
  console.log("MultiplayerGame mounted. GameID:", multiplayerStore.gameId);
  if (!multiplayerStore.gameId || (!gameStore.gameId && gameStore.locations.length === 0)) {
    router.push('/multiplayer/lobby');
    return;
  }
  isMapFullscreen.value = showRoundResults.value;

  if (gameStore.isRoundActive &&
    multiplayerStore.firstPlayerGuessedInRound &&
    !multiplayerStore.isWaitingForRoundEnd &&
    !showRoundResults.value &&
    multiplayerStore.roundDurationSeconds > 0) {
    isRoundTimerActive.value = true;
    startRoundTimer(multiplayerStore.roundDurationSeconds);
  } else if (gameStore.isRoundActive && !multiplayerStore.firstPlayerGuessedInRound) {
    isRoundTimerActive.value = true; // Timer display is active, but not counting yet
    roundTimeRemaining.value = multiplayerStore.roundDurationSeconds; // Show full time
  }
});

onUnmounted(() => {
  if (roundTimerInterval) clearInterval(roundTimerInterval);
});

watch(() => gameStore.currentRoundNumber, (newRound, oldRound) => {
  console.log(`MultiplayerGame watcher: Round changed to ${newRound}`);
  if (newRound > 0 && newRound !== oldRound) {
    if (roundTimerInterval) clearInterval(roundTimerInterval);
    isRoundTimerActive.value = false; // Will be set true by firstPlayerGuessed watcher
    roundTimeRemaining.value = multiplayerStore.roundDurationSeconds;
    isMapFullscreen.value = false;
    multiplayerStore.firstPlayerGuessedInRound = false;
  }
});

watch(showRoundResults, (isShowing) => {
  console.log(`MultiplayerGame watcher: showRoundResults changed to ${isShowing}`);
  isMapFullscreen.value = isShowing;
  if (isShowing) {
    if (roundTimerInterval) clearInterval(roundTimerInterval);
    isRoundTimerActive.value = false;
  }
});

watch(() => multiplayerStore.isWaitingForRoundEnd, (isWaiting) => {
  console.log(`MultiplayerGame watcher: isWaitingForRoundEnd changed to ${isWaiting}`);
  if (isWaiting) {
    if (roundTimerInterval) clearInterval(roundTimerInterval);
    isRoundTimerActive.value = false;
  }
});

watch(() => multiplayerStore.firstPlayerGuessedInRound, (firstGuessed) => {
  console.log(`MultiplayerGame watcher: firstPlayerGuessedInRound changed to ${firstGuessed}`);
  if (firstGuessed &&
    gameStore.isRoundActive &&
    !multiplayerStore.isWaitingForRoundEnd &&
    !showRoundResults.value &&
    multiplayerStore.roundDurationSeconds > 0) {
    console.log("First player guessed, starting round timer.");
    isRoundTimerActive.value = true;
    startRoundTimer(multiplayerStore.roundDurationSeconds);
  } else if (!firstGuessed) {
    if (roundTimerInterval) clearInterval(roundTimerInterval);
    isRoundTimerActive.value = gameStore.isRoundActive; // Show timer UI if round is active
    roundTimeRemaining.value = multiplayerStore.roundDurationSeconds;
  }
});

watch(() => gameStore.isRoundActive, (isActive) => {
  console.log(`MultiplayerGame watcher: gameStore.isRoundActive changed to ${isActive}`);
  if (!isActive) {
    if (roundTimerInterval) clearInterval(roundTimerInterval);
    isRoundTimerActive.value = false;
  } else {
    // When round becomes active (e.g. new round starts)
    // Timer display should be active, but not necessarily counting down yet
    isRoundTimerActive.value = true;
    roundTimeRemaining.value = multiplayerStore.roundDurationSeconds;
    // The actual countdown will start when firstPlayerGuessedInRound becomes true
  }
});

</script>

<style scoped>
.map-container :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}

/* Smooth transition for player status bar items */
.player-status-bar>div>div {
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.max-w-\[100px\] {
  max-width: 100px;
}
</style>