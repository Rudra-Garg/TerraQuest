// src/stores/MultiplayerStore.js
import { defineStore } from 'pinia';
import { ref, computed, nextTick } from 'vue';
import { useAuthStore } from './AuthStore';
import { useGameStore } from './GameStore';
import router from '../router';


export const useMultiplayerStore = defineStore('multiplayer', () => {
    // --- State ---
    const socket = ref(null);
    const isConnected = ref(false);
    const gameCode = ref(localStorage.getItem('currentGameCode') || '');
    const gameId = ref(localStorage.getItem('currentGameId') || null); // DB ID of the game
    const error = ref(null);
    const players = ref([]); // Array of PlayerDetailInfo { userId, username, isHost, isReady, currentHealth, status, totalScore }
    const chatMessages = ref([]);
    const isHost = ref(false);
    const gameLocations = ref([]);
    const roundsTotal = ref(0);
    const initialHealth = ref(6000); // Default, updated from server
    const roundDurationSeconds = ref(60); // <<< NEW: Default, updated from server
    const playerRoundResults = ref({}); // Stores results for each player for each round after MsgTypeRoundEnd
    const currentRoundActualLocation = ref(null);
    const currentRoundWinnerId = ref(null);
    const currentRoundMultiplier = ref(1.0);
    const showRoundResultsSummary = ref(false); // True when MsgTypeRoundEnd is received
    const firstPlayerGuessedInRound = ref(false); // <<< NEW: True when MsgTypeFirstPlayerGuessed is received
    const isWaitingForRoundEnd = ref(false); // <<< NEW: True after current user submits guess, until round_end

    const authStore = useAuthStore();
    const gameStore = useGameStore(); // gameStore holds currentRoundNumber, currentLocation etc.
    const MSG_TYPE_PLAYER_JOIN = "player_join";
    // ... (add other message types if you plan to use them as constants)
    const MSG_TYPE_HOST_PROCEED_TO_NEXT_ROUND = "host_proceed_next_round";
    // --- Computed ---
    const isCurrentPlayerReady = computed(() => {
        const currentPlayerId = authStore.userProfile?.id;
        const player = players.value.find(p => p.userId === currentPlayerId);
        return player?.isReady || false;
    });

    const isEveryoneReady = computed(() => {
        if (players.value.length < 1) return false;
        return players.value.every(p => p.isReady);
    });

    // This computed might not be directly used for core logic anymore,
    // as server dictates round end, but can be useful for UI.
    const haveAllPlayersGuessedCurrentRound = computed(() => {
        const currentRoundNum = gameStore.currentRoundNumber;
        if (currentRoundNum <= 0 || players.value.length === 0) return false;
        // Filter for active players as per server's view (status 'active')
        const activePlayersInLobby = players.value.filter(p => p.status === 'active');
        if (activePlayersInLobby.length === 0) return true; // No one to wait for

        return activePlayersInLobby.every(player =>
            playerRoundResults.value[player.userId]?.[currentRoundNum - 1]?.guess !== undefined
        );
    });


    // --- Actions ---

    function getWebSocketUrl(code) {
        // ... (no changes needed here)
        if (!code) return null;
        const token = authStore.authToken;
        if (!token) {
            console.error("Multiplayer Connect Error: No auth token available.");
            error.value = "You must be logged in to connect.";
            return null;
        }
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const cleanBaseUrl = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        return `${wsProtocol}://${cleanBaseUrl}/api/v1/multiplayer/ws?gameCode=${code}&token=${token}`;
    }


    function connect() {
        // ... (no changes needed here)
        if (socket.value && socket.value.readyState === WebSocket.OPEN) { return; }
        if (!gameCode.value) { return; }
        const url = getWebSocketUrl(gameCode.value);
        if (!url) return;

        console.log(`Attempting to connect WebSocket to: ${url}`);
        error.value = null;
        isConnected.value = false;

        try {
            socket.value = new WebSocket(url);

            socket.value.onopen = () => {
                console.log("WebSocket connection established.");
                isConnected.value = true;
                error.value = null;
            };

            socket.value.onmessage = (event) => {
                console.log("WS Message Received:", event.data);
                try {
                    const message = JSON.parse(event.data);
                    handleIncomingMessage(message);
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e, event.data);
                    error.value = "Received an invalid message from the server.";
                }
            };

            socket.value.onerror = (event) => {
                console.error("WebSocket error:", event);
                error.value = "WebSocket connection error.";
                isConnected.value = false;
                // socket.value = null; // Let onclose handle this
            };

            socket.value.onclose = (event) => {
                console.log(`WebSocket connection closed: Code=${event.code}, Reason=${event.reason}`);
                isConnected.value = false;
                if (event.code !== 1000 && event.code !== 1005) { // 1005: No status Rcvd (browser close)
                    error.value = `Connection closed unexpectedly (Code: ${event.code}). Refresh or rejoin may be needed.`;
                } else {
                    error.value = null; // Clear error on clean close
                }
                socket.value = null;
            };
        } catch (err) {
            console.error("Failed to create WebSocket:", err);
            error.value = "Failed to initialize WebSocket connection.";
            isConnected.value = false;
            socket.value = null;
        }
    }

    // --- Handle Incoming Messages ---
    function handleIncomingMessage(message) {
        console.log('Store: Processing message:', message.type, message.payload);
        switch (message.type) {
            case 'player_list_update':
                if (Array.isArray(message.payload)) {
                    players.value = message.payload;
                    const currentUser = players.value.find(p => p.userId === authStore.userProfile?.id);
                    isHost.value = currentUser?.isHost || false;
                    console.log("Updated players list:", players.value);
                }
                break;

            case 'chat_message':
                if (message.payload && message.payload.content) {
                    chatMessages.value.push(message.payload);
                }
                break; case 'game_start':
                if (message.payload && message.payload.gameDbId) {
                    console.log("Store: Received game_start", message.payload);
                    gameLocations.value = []; // Clear locations - will be loaded per round
                    roundsTotal.value = message.payload.roundsTotal || 5;
                    initialHealth.value = message.payload.initialHealth || 6000;
                    roundDurationSeconds.value = message.payload.roundDurationSeconds || 60;
                    if (gameId.value !== String(message.payload.gameDbId)) {
                        gameId.value = String(message.payload.gameDbId);
                        localStorage.setItem('currentGameId', gameId.value);
                    } gameStore.$patch({
                        gameId: gameId.value,
                        locations: [], // Will be populated per round
                        MAX_ROUNDS: roundsTotal.value,
                        currentRound: 0, // Will be incremented by MsgTypeRoundStart
                        totalScore: 0,
                        roundResults: [], // Single player game results
                        isGameOver: false,
                        isLoading: false,
                        gameError: null,
                    });
                    showRoundResultsSummary.value = false;
                    playerRoundResults.value = {}; // Reset multiplayer detailed results
                    firstPlayerGuessedInRound.value = false; // <<< NEW
                    isWaitingForRoundEnd.value = false; // <<< NEW

                    // Backend now sends MsgTypeRoundStart right after, no client action needed for round 1 start.
                    if (router.currentRoute.value.name !== 'MultiplayerGame') {
                        router.push({ name: 'MultiplayerGame' });
                    }
                } else {
                    error.value = "Failed to start game: Invalid data from server.";
                }
                break; case 'round_start':
                if (message.payload && message.payload.currentRound) {
                    console.log(`Store: Received round_start for round ${message.payload.currentRound}`);
                    showRoundResultsSummary.value = false;
                    firstPlayerGuessedInRound.value = false; // <<< NEW: Reset for new round
                    isWaitingForRoundEnd.value = false; // <<< NEW: Reset for new round
                    gameStore.currentGuess = null; // Clear map guess
                    roundDurationSeconds.value = message.payload.roundDurationSeconds || roundDurationSeconds.value; // Update if sent

                    // Handle the location for this round
                    if (message.payload.location) {
                        // Add this round's location to the gameStore
                        const newLocation = {
                            id: message.payload.location.id,
                            lat: message.payload.location.lat,
                            lng: message.payload.location.lng,
                            description: message.payload.location.description || ''
                        };

                        // Update locations array to include this round's location
                        gameStore.locations = [...gameStore.locations];
                        if (!gameStore.locations[message.payload.currentRound - 1]) {
                            gameStore.locations[message.payload.currentRound - 1] = newLocation;
                        }
                        console.log(`Store: Added location for round ${message.payload.currentRound}:`, newLocation);
                    }

                    // Logic from GameStore.nextRound(), adapted for multiplayer context
                    if (gameStore.currentRoundNumber !== message.payload.currentRound) {
                        gameStore.currentRound = message.payload.currentRound;
                    }
                    gameStore.isRoundActive = true;
                    gameStore.isLoading = false; // Ensure loading is false for round start
                    console.log(`Store: GameStore now at round ${gameStore.currentRoundNumber}, active: ${gameStore.isRoundActive}`);
                }
                break;

            case 'first_player_guessed': // <<< NEW
                if (message.payload && message.payload.roundNumber === gameStore.currentRoundNumber) {
                    console.log("Store: First player has guessed this round.");
                    firstPlayerGuessedInRound.value = true;
                    // The frontend UI (MultiplayerGame.vue) will use this to start its own visual countdown.
                }
                break;

            case 'guess_submit': // Individual guess confirmation
                if (message.payload) {
                    const { userId, username, roundNumber, score, totalScore } = message.payload;
                    console.log(`Store: Received guess_submit confirmation for ${username} (User ${userId}), Round ${roundNumber}, Score: ${score}, New Total: ${totalScore}`);

                    // Update the player's total score in the main players list for immediate UI feedback
                    const playerToUpdate = players.value.find(p => p.userId === userId);
                    if (playerToUpdate && totalScore !== undefined) {
                        playerToUpdate.totalScore = totalScore;
                    }

                    // Store this individual confirmed guess temporarily if needed for UI
                    // (e.g. to show checkmark next to player name)
                    // Ensure the structure matches what processRoundCompletion might expect for `playerRoundResults`
                    if (!playerRoundResults.value[userId]) {
                        playerRoundResults.value[userId] = new Array(roundsTotal.value).fill(null);
                    }
                    // We don't have full details (distance, etc.) yet, just that they guessed.
                    // `processRoundCompletion` will fill this with complete data.
                    // For now, just mark that a guess was made for this player and round, if needed.
                    // Example: you could store just the score here temporarily.
                    // playerRoundResults.value[userId][roundNumber - 1] = { score: score, guess: null, distanceKm: -1, damageTaken: 0 }; // Partial data


                    if (userId === authStore.userProfile?.id && roundNumber === gameStore.currentRoundNumber) {
                        gameStore.isRoundActive = false; // Current user cannot guess again this round
                        isWaitingForRoundEnd.value = true; // <<< NEW: Current user is now waiting for others or timer
                    }
                }
                break;

            case 'round_end':
                if (message.payload && message.payload.playerRoundResults) {
                    console.log("Store: Received round_end", message.payload);
                    currentRoundActualLocation.value = message.payload.actualLocation;
                    currentRoundWinnerId.value = message.payload.roundWinnerId;
                    currentRoundMultiplier.value = message.payload.currentMultiplier || 1.0;
                    isWaitingForRoundEnd.value = false; // <<< NEW: Round has officially ended

                    message.payload.playerRoundResults.forEach(pResult => {
                        if (!playerRoundResults.value[pResult.userId]) {
                            // Ensure array is initialized with correct length and nulls
                            playerRoundResults.value[pResult.userId] = new Array(roundsTotal.value).fill(null);
                        }
                        playerRoundResults.value[pResult.userId][message.payload.roundNumber - 1] = {
                            guess: pResult.guess,
                            distanceKm: pResult.distanceKm,
                            score: pResult.roundScore,
                            damageTaken: pResult.damageTaken,
                        };

                        const playerInList = players.value.find(p => p.userId === pResult.userId);
                        if (playerInList) {
                            playerInList.currentHealth = pResult.currentHealth;
                            playerInList.status = pResult.status;
                            playerInList.totalScore = pResult.totalScore; // Update total score from round_end
                        }
                    });

                    gameStore.isRoundActive = false;
                    showRoundResultsSummary.value = true;
                }
                break;

            case 'game_end':
                if (message.payload && message.payload.finalStandings) {
                    console.log("Store: Received game_end", message.payload);
                    players.value = message.payload.finalStandings.map(p => ({
                        userId: p.userId,
                        username: p.username,
                        isHost: players.value.find(pl => pl.userId === p.userId)?.isHost || false,
                        isReady: false,
                        currentHealth: p.finalHealth,
                        status: p.status,
                        totalScore: p.totalScore,
                        eliminatedAtRound: p.eliminatedAtRound, // <<< NEW
                    }));

                    gameStore.$patch({
                        isGameOver: true,
                        isRoundActive: false,
                        isLoading: false,
                    });
                    showRoundResultsSummary.value = false; // Game over screen takes precedence
                    isWaitingForRoundEnd.value = false; // <<< NEW
                }
                break;

            case 'error':
                if (message.payload && message.payload.message) {
                    error.value = message.payload.message;
                }
                break;

            default:
                console.warn("Store: Received unhandled WS message type:", message.type);
        }
    }



    // --- Send Messages ---
    function sendMessage(type, payload = {}) {
        // ... (no changes needed here)
        if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
            console.error(`Cannot send message: WebSocket not open. Type: ${type}`);
            error.value = "Not connected to server.";
            return;
        }
        const message = {
            type,
            payload,
            gameId: gameCode.value
        };
        console.log("Sending WS Message:", message);
        socket.value.send(JSON.stringify(message));
    }

    function setReady(readyStatus) {
        sendMessage('player_ready', { isReady: readyStatus });
    }

    function sendChatMessage(content) {
        if (!content?.trim()) return;
        sendMessage('chat_message', { content: content.trim() });
    }
    function hostStartGame() {
        // ... (no changes needed here)
        if (!isHost.value) {
            error.value = "Only the host can start the game.";
            return;
        }
        if (!isEveryoneReady.value) {
            error.value = "Cannot start until all players are ready.";
            return;
        }
        console.log("Host sending game_start message...");
        sendMessage('game_start');
    }

    function hostProceedToNextRound() {
        if (!isHost.value) {
            console.error("MultiplayerStore: Non-host tried to proceed to next round.");
            return;
        }
        console.log("MultiplayerStore: Host sending host_proceed_next_round");
        sendMessage(MSG_TYPE_HOST_PROCEED_TO_NEXT_ROUND); // MsgTypeHostProceedToNextRound needs to be a const
    }

    function submitGuess() {
        // ... (no changes needed here, uses gameStore.currentGuess)
        if (!gameStore.currentGuess) { error.value = "Make a guess first."; return; }
        if (!gameStore.isRoundActive) { console.warn("Guess submitted when round not active."); return; }

        console.log("MultiplayerStore: Submitting guess via WS:", gameStore.currentGuess);
        sendMessage('guess_submit', {
            roundNumber: gameStore.currentRoundNumber,
            guess: gameStore.currentGuess,
        });
        // isWaitingForRoundEnd.value = true; // Moved to after guess_submit confirmation from server
    }
    // --- API Actions (Create/Join - no changes from Phase 1) ---
    async function createGame(options) {
        // ... (no changes needed here for basic timer logic)
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const token = authStore.authToken;
        error.value = null;

        try {
            const response = await fetch(`${baseUrl}/api/v1/multiplayer/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(options), // `options` should include roundDurationSeconds
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Failed to create game (HTTP ${response.status})`);

            gameCode.value = data.gameCode;
            gameId.value = data.gameId;
            isHost.value = true;
            localStorage.setItem('currentGameCode', data.gameCode);
            localStorage.setItem('currentGameId', String(data.gameId));
            return true;
        } catch (err) {
            console.error("Create Game API Error:", err);
            error.value = err.message;
            clearGameData();
            return false;
        }
    }
    async function joinGame(code) {
        // ... (no changes needed here for basic timer logic)
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const token = authStore.authToken;
        error.value = null;

        try {
            const response = await fetch(`${baseUrl}/api/v1/multiplayer/join/${code}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Failed to join game (HTTP ${response.status})`);

            gameCode.value = code.toUpperCase();
            gameId.value = data.gameId;
            isHost.value = false;
            localStorage.setItem('currentGameCode', gameCode.value);
            localStorage.setItem('currentGameId', String(data.gameId));
            return true;
        } catch (err) {
            console.error("Join Game API Error:", err);
            error.value = err.message;
            clearGameData();
            return false;
        }
    }

    function leaveGame() {
        // ... (no changes needed here)
        console.log("Leaving game context...");
        disconnect();
        clearGameData(); // Resets most store state
        gameStore.$reset(); // Also reset single-player game store state
    }

    function disconnect() {
        // ... (no changes needed here)
        if (socket.value) {
            console.log("Disconnecting WebSocket...");
            socket.value.close(1000, "User initiated disconnect");
        } else {
            console.log("No active WebSocket connection to disconnect.");
        }
    }

    function clearGameData() {
        // ... (no changes needed here for basic timer logic beyond what was already there for reset)
        gameCode.value = '';
        gameId.value = null;
        localStorage.removeItem('currentGameCode');
        localStorage.removeItem('currentGameId');
        error.value = null;
        players.value = [];
        chatMessages.value = [];
        isHost.value = false;
        gameLocations.value = [];
        roundsTotal.value = 0;
        initialHealth.value = 6000;
        roundDurationSeconds.value = 60; // <<< NEW: Reset duration

        playerRoundResults.value = {};
        currentRoundActualLocation.value = null;
        currentRoundWinnerId.value = null;
        currentRoundMultiplier.value = 1.0;
        showRoundResultsSummary.value = false;
        firstPlayerGuessedInRound.value = false; // <<< NEW
        isWaitingForRoundEnd.value = false; // <<< NEW
    }

    return {
        // State
        socket, isConnected, gameCode, gameId, error, players, chatMessages, isHost,
        gameLocations, roundsTotal, initialHealth, roundDurationSeconds, // <<< EXPOSE
        playerRoundResults, currentRoundActualLocation, currentRoundWinnerId,
        currentRoundMultiplier, showRoundResultsSummary, firstPlayerGuessedInRound, // <<< EXPOSE
        isWaitingForRoundEnd, // <<< EXPOSE

        // Computed
        isCurrentPlayerReady, isEveryoneReady, haveAllPlayersGuessedCurrentRound,

        // Actions
        createGame, joinGame, connect, disconnect, leaveGame, clearGameData,
        setReady, sendChatMessage, hostStartGame, submitGuess, hostProceedToNextRound
    };
});