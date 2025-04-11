// src/stores/gameStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import gameService from '../services/gameService';

// Helper function (can be moved to a utils file later)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function calculateScore(distanceKm) {
    const maxScore = 5000;
    const score = Math.round(maxScore * Math.exp(-distanceKm / 2000));
    return Math.max(0, score);
}


export const useGameStore = defineStore('game', () => {
    // --- State ---
    const isMapsApiReady = ref(false);
    const gameId = ref(null);
    const currentRound = ref(0);
    const totalScore = ref(0);
    const locations = ref([]); // Will hold locations from backend { id, lat, lng }
    const currentGuess = ref(null);
    const roundResults = ref([]);
    const isRoundActive = ref(false);
    const isGameOver = ref(false);
    const isLoading = ref(false);
    const gameError = ref(null); 
    const MAX_ROUNDS = 5; // Set a default number of rounds
    const currentRoundNumber = computed(() => currentRound.value);
    const getCurrentLocation = computed(() => {
        if (currentRound.value > 0 && currentRound.value <= locations.value.length) {
            const loc = locations.value[currentRound.value - 1];
            // Return copy, ensure required fields exist
            return { id: loc.id, lat: loc.lat, lng: loc.lng };
        }
        return null;
    });

    // --- Getters (Computed) ---

    const getCurrentRoundResult = computed(() => {
        if (currentRound.value > 0 && currentRound.value <= roundResults.value.length) {
            return roundResults.value[currentRound.value - 1];
        }
        return null;
    });
    const hasSubmittedGuessForCurrentRound = computed(() => {
        // Check if there's a result for the current round number
        return roundResults.value.length >= currentRound.value && currentRound.value > 0;
    });


    // --- Actions ---
    function setMapsApiReady(value) {
        console.log(`Store: Setting Maps API Ready to ${value}`);
        isMapsApiReady.value = value;
    }

    function clearGameError() { // Helper to clear error state
        gameError.value = null;
    }

    async function startGame() {
        if (!isMapsApiReady.value) {
            console.error("Attempted to start game before Maps API is ready!");
            gameError.value = "Maps API is still loading. Please wait.";
            return;
        }

        console.log("Store: Attempting to start game via API...");
        isLoading.value = true;
        isGameOver.value = false;
        gameError.value = null; // Clear previous errors
        currentRound.value = 0;
        totalScore.value = 0;
        roundResults.value = [];
        currentGuess.value = null;
        locations.value = []; // Clear previous locations
        gameId.value = null;

        try {
            // --- Call Backend API ---
            const gameData = await gameService.startGame(MAX_ROUNDS);
            // ------------------------

            // --- Process Response ---
            if (!gameData || !gameData.locations || gameData.locations.length === 0) {
                throw new Error("Received invalid game data from server.");
            }

            gameId.value = gameData.gameId; // Use gameId from backend (even if placeholder)
            locations.value = gameData.locations; // Store fetched locations

            console.log(`Store: Game ${gameId.value} started, ${locations.value.length} locations loaded from backend.`);
            await nextRound(); // Start the first round

        } catch (error) {
            console.error("Store: Error starting game:", error.message);
            gameError.value = "Failed to start new game. Please try again later."; // Set user-friendly error
            isGameOver.value = true; // Set to game over state on error
            locations.value = []; // Ensure locations are empty on error
            gameId.value = null;
        } finally {
            isLoading.value = false;
        }
    }

    async function nextRound() {
        if (isGameOver.value) return;
        if (currentRound.value >= locations.value.length) { // Check against actual loaded locations count
            console.log("Game Over! Final Score:", totalScore.value);
            isGameOver.value = true;
            isRoundActive.value = false;
            return;
        }

        isLoading.value = true; // Indicate loading next round/location
        currentRound.value++;
        currentGuess.value = null;
        isRoundActive.value = true; // Make round playable
        console.log(`Store: Loading round ${currentRound.value}`);

        // Simulate loading delay or API fetch time for a specific location if needed
        // For now, location data is already loaded in startGame
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

        isLoading.value = false;
    }

    function recordGuess(guessCoords) {
        // Update the state with the coordinates selected on the map
        if (isRoundActive.value && !hasSubmittedGuessForCurrentRound.value) {
            currentGuess.value = guessCoords;
            console.log("Store: Guess recorded", currentGuess.value);
        }
    }

    async function submitGuess() {
        if (!currentGuess.value || !isRoundActive.value || hasSubmittedGuessForCurrentRound.value) {
            console.warn("Submit guess called in invalid state.");
            return;
        }

        const actualLocation = getCurrentLocation.value;
        if (!actualLocation) {
            console.error("Cannot submit guess, actual location not found for round.");
            return;
        }

        console.log("Store: Submitting guess", currentGuess.value, "for actual", actualLocation);
        isRoundActive.value = false; // Round is finished, waiting for next
        isLoading.value = true; // Show loading while calculating/saving

        const distance = calculateDistance(
            actualLocation.lat, actualLocation.lng,
            currentGuess.value.lat, currentGuess.value.lng
        );
        const score = calculateScore(distance);

        const result = {
            round: currentRound.value,
            guess: { ...currentGuess.value },
            actual: { lat: actualLocation.lat, lng: actualLocation.lng },
            distanceKm: distance,
            score: score
        };

        roundResults.value.push(result);
        totalScore.value += score;

        console.log("Store: Round result", result);

        // TODO: Send result to backend API
        // try {
        //   await gameService.submitRoundResult({
        //      gameId: gameId.value,
        //      round: currentRound.value,
        //      locationId: actualLocation.id,
        //      guessLat: currentGuess.value.lat,
        //      guessLng: currentGuess.value.lng,
        //      score: score
        //   });
        // } catch (error) {
        //    console.error("Failed to submit round result:", error);
        //    // Handle submission error? Maybe retry later?
        // }

        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API save delay
        isLoading.value = false;

        // The UI will now show the result and the "Next Round" button based on computed properties
    }

    // --- Return state, getters, and actions ---
    return {
        // State
        gameId,
        currentRound,
        totalScore,
        locations,
        currentGuess,
        roundResults,
        isRoundActive,
        isGameOver,
        isLoading,
        MAX_ROUNDS,
        isMapsApiReady,
        gameError,
        clearGameError,
        // Getters
        currentRoundNumber,
        getCurrentLocation,
        getCurrentRoundResult,
        hasSubmittedGuessForCurrentRound,

        // Actions
        startGame,
        nextRound,
        recordGuess,
        submitGuess,
        setMapsApiReady,
    };
});