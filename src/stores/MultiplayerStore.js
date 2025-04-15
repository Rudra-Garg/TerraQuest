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
        if (socket.value) socket.value.close();
        
        gameCode.value = code;
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        // Remove trailing slash if present
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        // Extract hostname from URL
        let wsHost = cleanBaseUrl.replace(/^https?:\/\//, '');
        // If the host includes a path, we need to keep it
        const wsUrl = `${wsProtocol}://${wsHost}/api/v1/multiplayer/ws?gameCode=${code}`;
        
        console.log('Connecting to WebSocket URL:', wsUrl);
        
        try {
            socket.value = new WebSocket(wsUrl);
            
            socket.value.onopen = () => {
                isConnected.value = true;
                error.value = null; // Clear any previous errors
                console.log('Connected to game server');
                
                // Send join message
                sendMessage('player_join', {
                    username: authStore.userProfile?.username,
                    userId: authStore.userProfile?.id,
                    isHost: isHost.value
                });
            };
            
            socket.value.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
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
            gameId: gameId.value,
            userId: authStore.userProfile?.id
        };
        
        socket.value.send(JSON.stringify(message));
    }
    
    function handleIncomingMessage(message) {
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'player_join':
                // Add player to list if not already present
                const newPlayer = message.payload;
                if (!players.value.some(p => p.userId === newPlayer.userId)) {
                    players.value.push(newPlayer);
                }
                break;
                
            case 'player_leave':
                // Remove player from list
                const leavingPlayerId = message.payload.userId;
                players.value = players.value.filter(p => p.userId !== leavingPlayerId);
                break;
                
            case 'player_ready':
                // Update player ready status
                const readyPlayer = players.value.find(p => p.userId === message.payload.userId);
                if (readyPlayer) {
                    readyPlayer.isReady = message.payload.isReady;
                }
                // Check if everyone is ready
                isEveryoneReady.value = players.value.length > 1 && 
                                       players.value.every(p => p.isReady);
                break;
                
            case 'game_start':
                // Start the game with locations from server
                gameStore.locations.value = message.payload.locations;
                gameStore.currentRound.value = 0;
                gameStore.isGameOver.value = false;
                gameStore.nextRound();
                break;
                
            case 'guess_submit':
                // Record other player's guess
                const { userId, roundNumber, guess } = message.payload;
                if (!playerResults.value[userId]) {
                    playerResults.value[userId] = [];
                }
                playerResults.value[userId][roundNumber - 1] = guess;
                
                // Check if all players have submitted for this round
                const allSubmitted = players.value.every(player => 
                    playerResults.value[player.userId] && 
                    playerResults.value[player.userId][gameStore.currentRound.value - 1]
                );
                
                if (allSubmitted) {
                    waitingForOtherPlayers.value = false;
                }
                break;
                
            case 'chat_message':
                // Add message to chat
                chatMessages.value.push(message.payload);
                break;
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
        sendMessage('player_ready', { 
            isReady: ready,
            userId: authStore.userProfile?.id
        });
    }
    
    function startGame() {
        if (!isHost.value || !isEveryoneReady.value) return;
        sendMessage('game_start', {});
    }
    
    function submitGuess() {
        if (!gameStore.currentGuess.value) return;
        
        // Submit guess locally first
        gameStore.submitGuess();
        
        // Then broadcast to other players
        sendMessage('guess_submit', {
            roundNumber: gameStore.currentRound.value,
            guess: gameStore.getCurrentRoundResult.value,
            userId: authStore.userProfile?.id
        });
        
        // Set waiting state
        waitingForOtherPlayers.value = true;
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