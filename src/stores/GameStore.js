// src/stores/gameStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// Import your API service later when created
// import gameService from '@/services/gameService';

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
    const gameId = ref(null); // ID from backend later
    const currentRound = ref(0); // Start at 0, increment before loading
    const totalScore = ref(0);
    const locations = ref([]); // Holds the locations for the current game { id, lat, lng, ... }
    const currentGuess = ref(null); // Player's guess { lat, lng }
    const roundResults = ref([]); // Array to store results of each round { guess, actual, distanceKm, score }
    const isRoundActive = ref(false); // Is a round currently playable?
    const isGameOver = ref(false);
    const isLoading = ref(false); // For loading states (e.g., fetching location)

    // Mock locations for now (replace with API call)
    const MOCK_LOCATIONS = [
        { id: 1, lat: 40.75798, lng: -73.9855, country: 'USA', region: 'New York' },
        { id: 2, lat: 48.8584, lng: 2.2945, country: 'France', region: 'Paris' },
        { id: 3, lat: -33.8568, lng: 151.2153, country: 'Australia', region: 'Sydney' },
        { id: 4, lat: 35.6586, lng: 139.7454, country: 'Japan', region: 'Tokyo' },
        { id: 5, lat: 51.5007, lng: -0.1246, country: 'UK', region: 'London' }
    ];
    const MAX_ROUNDS = 5;

    // --- Getters (Computed) ---
    const currentRoundNumber = computed(() => currentRound.value);
    const getCurrentLocation = computed(() => {
        if (currentRound.value > 0 && currentRound.value <= locations.value.length) {
            return locations.value[currentRound.value - 1];
        }
        return null;
    });
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
    async function startGame() {
        console.log("Starting new game...");
        isLoading.value = true;
        isGameOver.value = false;
        currentRound.value = 0;
        totalScore.value = 0;
        roundResults.value = [];
        currentGuess.value = null;
        gameId.value = `mock_game_${Date.now()}`; // Mock game ID

        try {
            // TODO: Replace with API call to initialize game and get locations
            // const gameData = await gameService.initializeGame();
            // gameId.value = gameData.gameId;
            // locations.value = gameData.locations;

            // Using mock data for now:
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            locations.value = [...MOCK_LOCATIONS]; // Use a copy

            console.log("Game started, locations loaded:", locations.value);
            await nextRound(); // Automatically start the first round

        } catch (error) {
            console.error("Error starting game:", error);
            // TODO: Handle error (e.g., show notification)
            isGameOver.value = true; // Prevent further actions if setup fails
        } finally {
            isLoading.value = false;
        }
    }

    async function nextRound() {
        if (isGameOver.value) return;

        if (currentRound.value >= MAX_ROUNDS) {
            console.log("Game Over! Final Score:", totalScore.value);
            isGameOver.value = true;
            isRoundActive.value = false;
            // TODO: Maybe call an API endpoint to finalize the game score
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
    };
});