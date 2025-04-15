import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './AuthStore';
import { useGameStore } from './GameStore';

export const useMultiplayerStore = defineStore('multiplayer', () => {
    const gameStore = useGameStore();
    const authStore = useAuthStore();
    
    // --- State ---
    const isHost = ref(false);
    const gameCode = ref('');
    const gameId = ref(null);
    const players = ref([]);
    const isConnected = ref(false);
    const socket = ref(null);
    const chatMessages = ref([]);
    const isEveryoneReady = ref(false);
    const waitingForOtherPlayers = ref(false);
    const playerResults = ref({}); // Map of userID -> round results
    const error = ref(null);
    
    // --- WebSocket handling ---
    function connectToGame(code) {
        if (socket.value) {
            socket.value.close();
            socket.value = null;
        }
        
        // Reset state when connecting
        players.value = [];
        isEveryoneReady.value = false;
        waitingForOtherPlayers.value = false;
        chatMessages.value = [];
        error.value = null;
        
        gameCode.value = code;
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        // Remove trailing slash if present
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        // Extract hostname from URL
        let wsHost = cleanBaseUrl.replace(/^https?:\/\//, '');
        // Include auth token in the URL
        const token = authStore.token;
        const wsUrl = `${wsProtocol}://${wsHost}/api/v1/multiplayer/ws?gameCode=${code}&token=${token}`;
        
        console.log('Connecting to WebSocket URL:', wsUrl);
        
        try {
            socket.value = new WebSocket(wsUrl);
            
            socket.value.onopen = () => {
                isConnected.value = true;
                error.value = null; // Clear any previous errors
                console.log('Connected to game server');
                
                // Prepare player join data
                const playerData = {
                    username: authStore.userProfile?.username || 'Guest',
                    userId: authStore.userProfile?.id,
                    isHost: isHost.value
                };
                
                console.log('Sending player_join message:', playerData);
                
                // Send join message
                sendMessage('player_join', playerData);
            };
            
            socket.value.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Received WebSocket message:', message);
                    handleIncomingMessage(message);
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                }
            };
            
            socket.value.onclose = (event) => {
                isConnected.value = false;
                console.log('WebSocket connection closed:', event.code, event.reason);
                
                // Only set error if not a normal closure and not already set
                if (event.code !== 1000 && !error.value) {
                    error.value = 'Connection to game server lost. Please try again.';
                }
                
                // Attempt to reconnect if not a normal closure
                if (event.code !== 1000) {
                    setTimeout(() => {
                        if (!isConnected.value) {
                            console.log('Attempting to reconnect...');
                            connectToGame(code);
                        }
                    }, 3000); // Try to reconnect after 3 seconds
                }
            };
            
            socket.value.onerror = (event) => {
                console.error('WebSocket error:', event);
                isConnected.value = false;
                error.value = 'Error connecting to game server. Please check your connection.';
            };
        } catch (err) {
            console.error('Failed to create WebSocket connection:', err);
            error.value = 'Failed to connect to game server. Please try again.';
        }
    }
    
    function sendMessage(type, payload) {
        if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
            console.error('Socket not connected');
            return;
        }
        
        const message = {
            type,
            payload,
            gameId: gameId.value ? String(gameId.value) : null,
            userId: authStore.userProfile?.id
        };
        
        socket.value.send(JSON.stringify(message));
    }
    
    function handleIncomingMessage(message) {
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'player_list_update':
                // Ensure message.payload is an array
                if (!Array.isArray(message.payload)) {
                    console.error('Invalid player list received:', message.payload);
                    return;
                }
                
                // Replace the entire player list with the received list
                players.value = message.payload;
                console.log('Updated players list from server:', players.value);
                
                // Update host status if needed
                const currentUser = players.value.find(p => p.userId === authStore.userProfile?.id);
                if (currentUser) {
                    isHost.value = currentUser.isHost;
                    console.log('Updated host status:', isHost.value);
                }
                
                // Re-check if everyone is ready based on the new list
                isEveryoneReady.value = players.value.length > 1 && 
                                       players.value.every(p => p.isReady);
                console.log('Everyone ready check:', isEveryoneReady.value);
                break;

            case 'player_join':
                // A single player joined, update the list
                const newPlayer = message.payload;
                console.log('Processing player join:', newPlayer);
                
                // Remove the player if they already exist (to avoid duplicates)
                players.value = players.value.filter(p => p.userId !== newPlayer.userId);
                
                // Add the new player
                players.value.push(newPlayer);
                console.log('Updated players after join:', players.value);
                
                // Update host status if needed
                if (newPlayer.userId === authStore.userProfile?.id) {
                    isHost.value = newPlayer.isHost;
                    console.log('Updated host status:', isHost.value);
                }
                break;
                
            case 'player_leave':
                // A single player left, update the list
                const leavingPlayerId = message.payload.userId;
                players.value = players.value.filter(p => p.userId !== leavingPlayerId);
                console.log('Player left:', leavingPlayerId, 'Updated players:', players.value);
                
                // Re-check if everyone is ready based on the new list
                isEveryoneReady.value = players.value.length > 1 && 
                                       players.value.every(p => p.isReady);
                break;
                
            case 'player_ready':
                // A single player's ready status changed
                const readyData = message.payload;
                const readyPlayer = players.value.find(p => p.userId === readyData.userId);
                if (readyPlayer) {
                    readyPlayer.isReady = readyData.isReady;
                    console.log(`Player ${readyPlayer.username} ready status updated: ${readyData.isReady}`);
                    
                    // Re-check if everyone is ready
                    isEveryoneReady.value = players.value.length > 1 && 
                                           players.value.every(p => p.isReady);
                    console.log('Everyone ready check:', isEveryoneReady.value);
                }
                break;
                
            case 'game_start':
                console.log('Game start message received:', message);
                
                // Extract locations from the payload
                if (!message.payload || !message.payload.locations) {
                    console.error('Game start message missing locations data', message);
                    error.value = 'Failed to start game: Missing location data';
                    return;
                }
                
                // Process locations from server
                const locations = message.payload.locations.map(loc => ({
                    id: loc.id,
                    lat: loc.lat,
                    lng: loc.lng
                }));
                
                console.log('Starting game with locations:', locations);
                
                // Reset game state in GameStore
                gameStore.$patch({
                    isLoading: true,
                    isGameOver: false,
                    gameError: null,
                    currentRound: 0,
                    totalScore: 0,
                    roundResults: [],
                    currentGuess: null,
                    locations: locations,
                    gameId: message.gameId
                });
                
                // Start first round
                gameStore.nextRound();
                gameStore.$patch({ isLoading: false });
                
                // Reset multiplayer state
                waitingForOtherPlayers.value = false;
                playerResults.value = {};
                break;
                
            case 'guess_submit':
                // Record other player's guess
                const { userId, roundNumber, guess, score, distanceKm } = message.payload;
                if (!playerResults.value[userId]) {
                    playerResults.value[userId] = [];
                }
                
                // Store the guess result
                playerResults.value[userId][roundNumber - 1] = {
                    guess: { lat: guess.lat, lng: guess.lng },
                    score: score,
                    distanceKm: distanceKm
                };
                
                // Check if all players have submitted for this round
                const allSubmitted = players.value.every(player => 
                    playerResults.value[player.userId] && 
                    playerResults.value[player.userId][gameStore.currentRound.value - 1]
                );
                
                if (allSubmitted) {
                    waitingForOtherPlayers.value = false;
                    // If this is the last player to submit, show results
                    if (gameStore.isRoundActive.value) {
                        gameStore.isRoundActive.value = false;
                    }
                }
                break;
                
            case 'chat_message':
                // Add message to chat
                chatMessages.value.push(message.payload);
                break;

            default:
                console.warn('Received unknown message type:', message.type);
        }
    }
    
    // --- Actions ---
    async function createGame(options = { maxPlayers: 4, roundsTotal: 5 }) {
        try {
            error.value = null;
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
            // Remove trailing slash if present
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            
            console.log('Creating game at URL:', `${cleanBaseUrl}/api/v1/multiplayer/create`);
            
            const response = await fetch(`${cleanBaseUrl}/api/v1/multiplayer/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(options)
            });
            
            if (!response.ok) {
                let errorMessage = 'Failed to create game';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If response is not valid JSON, use text content
                    errorMessage = await response.text();
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            gameCode.value = data.gameCode;
            gameId.value = data.gameId;
            isHost.value = true;
            
            // Connect to WebSocket
            connectToGame(data.gameCode);
            
            return data;
        } catch (err) {
            console.error('Error creating multiplayer game:', err);
            error.value = err.message;
            throw err;
        }
    }
    
    async function joinGame(code) {
        try {
            error.value = null;
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
            // Remove trailing slash if present
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            
            const response = await fetch(`${cleanBaseUrl}/api/v1/multiplayer/join/${code}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            });
            
            if (!response.ok) {
                let errorMessage = 'Failed to join game';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If response is not valid JSON, use text content
                    errorMessage = await response.text();
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            gameId.value = data.gameId;
            gameCode.value = code;
            isHost.value = false;
            
            // Connect to WebSocket
            connectToGame(code);
            
            return data;
        } catch (err) {
            console.error('Error joining multiplayer game:', err);
            error.value = err.message;
            throw err;
        }
    }
    
    function setReady(ready = true) {
        if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
            console.error('Socket not connected');
            return;
        }
        
        console.log('Setting ready status to:', ready);
        sendMessage('player_ready', { isReady: ready });
    }
    
    function startGame() {
        if (!isHost.value) {
            console.error('Only the host can start the game');
            return;
        }
        
        if (!isEveryoneReady.value) {
            console.error('Cannot start game until everyone is ready');
            return;
        }
        
        console.log('Host starting game...');
        sendMessage('game_start', {});
    }
    
    function submitGuess() {
        if (!gameStore.currentGuess.value || !gameStore.isRoundActive.value) {
            console.warn("Cannot submit guess: no guess recorded or round not active");
            return;
        }

        const actualLocation = gameStore.getCurrentLocation.value;
        if (!actualLocation) {
            console.error("Cannot submit guess: actual location not found for round");
            return;
        }

        // Calculate distance and score
        const distance = gameStore.calculateDistance(
            actualLocation.lat, actualLocation.lng,
            gameStore.currentGuess.value.lat, gameStore.currentGuess.value.lng
        );
        const score = gameStore.calculateScore(distance);

        // Create the guess result
        const result = {
            round: gameStore.currentRound.value,
            guess: { ...gameStore.currentGuess.value },
            actual: { lat: actualLocation.lat, lng: actualLocation.lng },
            distanceKm: distance,
            score: score
        };

        // Store result locally
        gameStore.roundResults.value.push(result);
        gameStore.totalScore.value += score;

        // Send guess to other players
        sendMessage('guess_submit', {
            roundNumber: gameStore.currentRound.value,
            guess: gameStore.currentGuess.value,
            score: score,
            distanceKm: distance
        });

        // Set waiting state
        waitingForOtherPlayers.value = true;
        gameStore.isRoundActive.value = false;
    }
    
    function sendChatMessage(content) {
        sendMessage('chat_message', {
            content,
            username: authStore.userProfile?.username,
            timestamp: new Date().toISOString()
        });
    }
    
    function leaveGame() {
        if (socket.value) {
            sendMessage('player_leave', {
                userId: authStore.userProfile?.id
            });
            socket.value.close();
        }
        
        // Reset state
        isHost.value = false;
        gameCode.value = '';
        gameId.value = null;
        players.value = [];
        isConnected.value = false;
        socket.value = null;
        chatMessages.value = [];
        isEveryoneReady.value = false;
        waitingForOtherPlayers.value = false;
        playerResults.value = {};
        error.value = null;
    }
    
    // --- Getters ---
    const isCurrentPlayerReady = computed(() => {
        const currentPlayerId = authStore.userProfile?.id;
        const player = players.value.find(p => p.userId === currentPlayerId);
        return player?.isReady || false;
    });
    
    // --- Return state, getters, and actions ---
    return {
        // State
        isHost,
        gameCode,
        gameId,
        players,
        isConnected,
        chatMessages,
        isEveryoneReady,
        waitingForOtherPlayers,
        playerResults,
        error,
        
        // Getters
        isCurrentPlayerReady,
        
        // Actions
        createGame,
        joinGame,
        leaveGame,
        setReady,
        startGame,
        submitGuess,
        sendChatMessage
    };
}); 