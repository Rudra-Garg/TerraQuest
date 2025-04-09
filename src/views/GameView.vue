<template>
  <div class="p-4 space-y-4 relative">
    <!-- Loading Overlay -->
    <div v-if="gameStore.isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
       <p class="text-xl font-semibold">Loading...</p>
    </div>

    <!-- Start Game Button -->
    <div v-if="!gameStore.gameId && !gameStore.isGameOver" class="text-center">
       <button @click="startGameHandler" class="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg">
           Start New Game
       </button>
    </div>

    <!-- Game Content -->
    <div v-if="gameStore.gameId && !gameStore.isGameOver">
      <h1 class="text-2xl font-bold">Round {{ gameStore.currentRoundNumber }} / {{ gameStore.MAX_ROUNDS }}</h1>

      <!-- Street View Display -->
      <StreetViewDisplay :location="gameStore.getCurrentLocation" v-if="gameStore.getCurrentLocation"/>
      <div v-else class="w-full h-[50vh] bg-gray-300 flex items-center justify-center">
          Waiting for location...
      </div>

      <!-- Map for Guessing -->
      <!-- Add :key to force re-render/reset maybe? Or rely on resetMarker -->
      <MapDisplay
          @guess-made="handleMapGuess"
          ref="mapDisplayRef"
          :round-active="gameStore.isRoundActive"
          :submitted="gameStore.hasSubmittedGuessForCurrentRound"
          :actual-location="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentLocation : null"
          :guess-location="gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentRoundResult?.guess : null"
      />

      <!-- Guessing Controls -->
      <div class="flex flex-col items-center space-y-2 mt-4">
         <p v-if="gameStore.currentGuess && !gameStore.hasSubmittedGuessForCurrentRound">
             Selected Guess: {{ gameStore.currentGuess.lat.toFixed(4) }}, {{ gameStore.currentGuess.lng.toFixed(4) }}
         </p>
         <div class="flex justify-center space-x-4">
             <button
               @click="submitGuessHandler"
               :disabled="!gameStore.currentGuess || !gameStore.isRoundActive || gameStore.hasSubmittedGuessForCurrentRound"
               class="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
             >
               {{ gameStore.hasSubmittedGuessForCurrentRound ? 'Submitted' : 'Submit Guess' }}
             </button>
             <button
                 v-if="gameStore.hasSubmittedGuessForCurrentRound && gameStore.currentRoundNumber < gameStore.MAX_ROUNDS"
                 @click="nextRoundHandler"
                 class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
             >
                 Next Round
             </button>
              <button
                 v-if="gameStore.hasSubmittedGuessForCurrentRound && gameStore.currentRoundNumber === gameStore.MAX_ROUNDS"
                 @click="viewResultsHandler"
                 class="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
             >
                 View Final Results
             </button>
         </div>
      </div>

       <!-- Round Result Display -->
       <div v-if="gameStore.hasSubmittedGuessForCurrentRound && gameStore.getCurrentRoundResult" class="mt-4 p-4 border rounded bg-gray-50">
           <h3 class="font-semibold">Round {{ gameStore.currentRoundNumber }} Result</h3>
           <p>Distance: {{ gameStore.getCurrentRoundResult.distanceKm.toFixed(2) }} km</p>
           <p>Score: {{ gameStore.getCurrentRoundResult.score }} points</p>
           <!-- MapDisplay will now show the markers/line based on props -->
       </div>
       <div class="mt-4 text-xl font-semibold text-center">Total Score: {{ gameStore.totalScore }}</div>
    </div>

    <!-- Game Over Display -->
     <div v-if="gameStore.isGameOver && gameStore.gameId" class="text-center p-6 border rounded bg-yellow-100">
         <h2 class="text-3xl font-bold text-yellow-800 mb-4">Game Over!</h2>
         <p class="text-xl mb-2">Your final score is:</p>
         <p class="text-4xl font-bold mb-6">{{ gameStore.totalScore }}</p>
         <button @click="startGameHandler" class="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg">
           Play Again?
         </button>
          <!-- TODO: Link to detailed results/leaderboard -->
     </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'; // If needed for navigation
import StreetViewDisplay from '../components/StreetViewDisplay.vue';
import MapDisplay from '../components/MapDisplay.vue';
import { useGameStore } from '../stores/gameStore'; // Import the store

const gameStore = useGameStore();
const router = useRouter(); // Optional, for navigation
const mapDisplayRef = ref(null); // Ref to access MapDisplay methods

// --- Component Logic ---

// Handler for starting the game (calls store action)
function startGameHandler() {
    gameStore.startGame();
}

// Handler for recording guess from map (calls store action)
function handleMapGuess(coordinates) {
    gameStore.recordGuess(coordinates);
}

// Handler for submitting guess (calls store action)
function submitGuessHandler() {
    gameStore.submitGuess();
}

// Handler for next round (calls store action)
function nextRoundHandler() {
    mapDisplayRef.value?.resetMapState(); // Call method on child to clear lines/markers
    gameStore.nextRound();
}

// Handler for viewing final results (example)
function viewResultsHandler() {
    console.log("Navigating to results...");
    gameStore.isGameOver = true; // Ensure game over state is set if clicking early
    // router.push('/results/' + gameStore.gameId); // Example navigation
}


// --- Watchers ---
// Watch for the round change to potentially reset map state if needed
// (Though reset is now explicitly called in nextRoundHandler)
watch(() => gameStore.currentRoundNumber, (newRound, oldRound) => {
    if (newRound > oldRound && mapDisplayRef.value) {
         console.log(`GameView: Detected round change to ${newRound}. Map should reset.`);
        // mapDisplayRef.value.resetMapState(); // Moved to nextRoundHandler for better timing
    }
});

 // Watch for the location changing to ensure StreetView updates
 watch(() => gameStore.getCurrentLocation, (newLocation) => {
     if (newLocation) {
         console.log("GameView: Location changed in store, StreetViewDisplay should update.");
         // StreetViewDisplay component internally watches its prop
     }
 });

// --- Lifecycle Hooks ---
onMounted(() => {
  // If navigating directly to /game, decide if we need to start a new game
  // or perhaps load an existing game state (more advanced)
  // For now, we require clicking "Start New Game"
  console.log("GameView mounted. Current store state:", {
      gameId: gameStore.gameId,
      round: gameStore.currentRoundNumber,
      isOver: gameStore.isGameOver
  });
  // Optionally: If there's an active game in the store but no location, trigger nextRound?
  // if (gameStore.gameId && !gameStore.getCurrentLocation && !gameStore.isGameOver) {
  //    gameStore.nextRound(); // Might be needed if refreshing page mid-game later
  // }
});

</script>

<style scoped>
/* Add any specific styles for GameView */
</style>