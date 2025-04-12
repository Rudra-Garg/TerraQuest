Okay, let's add multiplayer functionality using WebSockets. This will involve significant changes to both the backend and frontend.

**Core Concepts:**

1.  **Game Rooms:** We'll use the WebSocket Hub to manage distinct "rooms," where each room represents an active multiplayer game session.
2.  **Server-Side State:** The server will maintain the state for each multiplayer game (players, current round, scores, guesses).
3.  **WebSocket Communication:** Clients will send actions (like guesses) via WebSocket, and the server will broadcast game state updates (new rounds, results, player joins/leaves) to all clients in the same room.
4.  **Authentication:** We need to associate WebSocket connections with authenticated users.

---

**Backend Changes**

**1. Enhance WebSocket Hub and Client (`internal/websocket/`)**

We need to modify the existing `Hub` and `Client` to support game rooms and user identification.

```go
// internal/websocket/hub.go
package websocket

import (
	"log"
	"sync"

	"geoguessr-backend/internal/models" // Assuming game state model exists
)

// Message defines the structure for messages sent over WebSocket
type Message struct {
	Type    string      `json:"type"`              // e.g., "join", "guess", "round_start", "error", "player_update"
	Payload interface{} `json:"payload,omitempty"` // Data specific to the message type
	RoomID  string      `json:"roomId,omitempty"`  // Target room for broadcast or client's room
	UserID  uint        `json:"userId,omitempty"`  // Sender's user ID
}

// Room represents a single game session with its clients and state
type Room struct {
	ID      string
	Clients map[*Client]bool
	// Add game state management here - simplistic example
	GameState interface{} // TODO: Replace with a proper models.MultiplayerGameState struct
	mu        sync.RWMutex
}

// Hub maintains the set of active clients and broadcasts messages.
type Hub struct {
	// Registered clients. Maps client pointer to boolean (presence)
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan Message // Changed to Message struct

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	// Game Rooms mapped by Room ID (Game ID)
	rooms map[string]*Room
	mu    sync.RWMutex // Mutex for thread-safe access to rooms map
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]*Room),
	}
}

func (h *Hub) Run() {
	log.Println("WebSocket Hub started.")
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client registered: User %d", client.UserID)
			// Room joining logic will happen elsewhere (when client sends 'join' message)

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				h.LeaveRoom(client) // Ensure client leaves room on disconnect
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client unregistered: User %d", client.UserID)
			}

		case message := <-h.broadcast:
			h.mu.RLock()
			room, roomExists := h.rooms[message.RoomID]
			h.mu.RUnlock()

			if roomExists {
				room.mu.RLock()
				// log.Printf("Broadcasting message type '%s' to room %s", message.Type, message.RoomID)
				for client := range room.Clients {
					// Optional: Don't send back to sender if not needed
					// if client.UserID == message.UserID && message.Type == "some_type_not_for_sender" {
					//  continue
					// }
					select {
					case client.send <- message:
					default:
						// Assume client is dead or blocked, cleanup needed
						log.Printf("Failed to send message to client %d in room %s. Closing channel.", client.UserID, room.ID)
						h.LeaveRoom(client)
						delete(h.clients, client)
						close(client.send)
					}
				}
				room.mu.RUnlock()
			} else {
				log.Printf("Warning: Attempted to broadcast to non-existent room: %s", message.RoomID)
			}
		}
	}
}

// CreateRoom initializes a new game room.
func (h *Hub) CreateRoom(roomID string, gameState interface{}) (*Room, error) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, exists := h.rooms[roomID]; exists {
		// Maybe allow re-joining or handle differently?
		log.Printf("Room %s already exists.", roomID)
		// Return existing room? For now, let's assume creation implies new
		// return h.rooms[roomID], fmt.Errorf("room %s already exists", roomID)
		return h.rooms[roomID], nil // Return existing room if creation is called again
	}
	room := &Room{
		ID:        roomID,
		Clients:   make(map[*Client]bool),
		GameState: gameState,
	}
	h.rooms[roomID] = room
	log.Printf("Room created: %s", roomID)
	return room, nil
}

// JoinRoom adds a client to a specific room.
func (h *Hub) JoinRoom(client *Client, roomID string) {
	h.mu.RLock()
	room, exists := h.rooms[roomID]
	h.mu.RUnlock()

	if !exists {
		log.Printf("Error: Client %d attempted to join non-existent room %s", client.UserID, roomID)
		// Send error message back to client?
		client.send <- Message{Type: "error", Payload: "Room not found"}
		// Close connection? Or let client handle? For now, just log.
		return
	}

	// Leave previous room if any (optional, depends on logic)
	h.LeaveRoom(client)

	room.mu.Lock()
	room.Clients[client] = true
	client.room = room // Assign room to client
	room.mu.Unlock()

	log.Printf("Client %d joined room %s", client.UserID, roomID)

	// Notify others in the room about the new player
	// TODO: Fetch username from DB based on client.UserID
	joinMsg := Message{
		Type:   "player_joined",
		RoomID: roomID,
		UserID: client.UserID, // Let clients know who joined
		Payload: map[string]interface{}{
			"userId":   client.UserID,
			"username": "User_" + fmt.Sprint(client.UserID), // Placeholder username
		},
	}
	h.broadcast <- joinMsg

	// Send current game state to the joining client
	// TODO: Fetch actual game state and player list
	currentState := Message{
		Type:   "game_state",
		RoomID: roomID,
		Payload: map[string]interface{}{
			"message": "Welcome! Current game state placeholder.",
			"round":   1, // Example state
			"players": []map[string]interface{}{{"userId": client.UserID, "username": "User_" + fmt.Sprint(client.UserID)}}, // Example players list
		},
	}
	client.send <- currentState
}

// LeaveRoom removes a client from their current room.
func (h *Hub) LeaveRoom(client *Client) {
	if client.room == nil {
		return // Not in any room
	}

	room := client.room
	roomID := room.ID

	room.mu.Lock()
	if _, ok := room.Clients[client]; ok {
		delete(room.Clients, client)
		log.Printf("Client %d left room %s", client.UserID, roomID)
		client.room = nil // Remove room reference from client

		// Notify remaining clients
		if len(room.Clients) > 0 {
			leaveMsg := Message{
				Type:   "player_left",
				RoomID: roomID,
				UserID: client.UserID, // Let clients know who left
				Payload: map[string]interface{}{
					"userId": client.UserID,
				},
			}
			room.mu.Unlock() // Unlock before sending to broadcast to avoid deadlock
			h.broadcast <- leaveMsg
		} else {
			// If room is empty, delete it
			room.mu.Unlock() // Unlock before acquiring hub lock
			h.mu.Lock()
			delete(h.rooms, roomID)
			log.Printf("Room %s deleted (empty).", roomID)
			h.mu.Unlock()
		}

	} else {
		room.mu.Unlock()
	}
}

// --- Add Game Logic Methods ---
// Example: Process a guess received from a client
func (h *Hub) HandleGuess(client *Client, guessPayload map[string]interface{}) {
	if client.room == nil {
		client.send <- Message{Type: "error", Payload: "You are not in a room."}
		return
	}

	room := client.room
	roomID := room.ID
	userID := client.UserID

	// TODO:
	// 1. Validate the guess (is the round active? has user already guessed?)
	// 2. Store the guess associated with the user and current round in room.GameState
	// 3. Check if all players in the room have guessed for the current round.
	// 4. If all guessed, calculate results, update scores, end round, broadcast results.
	// 5. If not all guessed, maybe broadcast the guess to others (optional).

	log.Printf("Guess received from User %d in Room %s: %v", userID, roomID, guessPayload)

	// Broadcast confirmation or update to room (Example)
	guessUpdateMsg := Message{
		Type:   "guess_received",
		RoomID: roomID,
		UserID: userID,
		Payload: map[string]interface{}{
			"userId": userID,
			"guess":  guessPayload, // Send back the guess data
		},
	}
	h.broadcast <- guessUpdateMsg

	// --- Example: Simplified end-of-round logic ---
	// This needs proper state management based on room.GameState
	room.mu.Lock()
	// Pretend this check determines if round ends
	roundShouldEnd := true // Replace with actual logic: all players guessed?
	room.mu.Unlock()

	if roundShouldEnd {
		h.EndRound(roomID)
	}
	// -------------------------------------------
}

// Example: End the current round and potentially start the next
func (h *Hub) EndRound(roomID string) {
	h.mu.RLock()
	room, exists := h.rooms[roomID]
	h.mu.RUnlock()
	if !exists {
		return
	}

	room.mu.Lock()
	// TODO:
	// 1. Calculate scores for all players based on guesses in room.GameState
	// 2. Update total scores in room.GameState
	// 3. Prepare results payload
	// 4. Determine if game ends or next round starts
	room.mu.Unlock() // Unlock before broadcast

	// Example round end message
	resultsPayload := map[string]interface{}{
		"message": "Round finished! Results placeholder.",
		"scores":  []map[string]interface{}{{"userId": 1, "roundScore": 4000, "totalScore": 8500}}, // Example
	}
	roundEndMsg := Message{
		Type:    "round_end",
		RoomID:  roomID,
		Payload: resultsPayload,
	}
	h.broadcast <- roundEndMsg

	// Example: Trigger next round after a delay
	go func() {
		time.Sleep(5 * time.Second) // Wait 5 seconds before next round
		h.StartNextRound(roomID)
	}()
}

// Example: Start the next round
func (h *Hub) StartNextRound(roomID string) {
	h.mu.RLock()
	room, exists := h.rooms[roomID]
	h.mu.RUnlock()
	if !exists {
		return
	}

	room.mu.Lock()
	// TODO:
	// 1. Increment round number in room.GameState
	// 2. Check if game over (max rounds reached)
	// 3. If not game over, get next location
	// 4. Reset round-specific state (like received guesses)
	nextRoundNumber := 2       // Example
	nextLocation := MOCK_LOCATION // Example
	room.mu.Unlock() // Unlock before broadcast

	if MOCK_IS_GAME_OVER { // Replace with actual check
		h.EndGame(roomID)
		return
	}

	roundStartMsg := Message{
		Type:   "round_start",
		RoomID: roomID,
		Payload: map[string]interface{}{
			"roundNumber": nextRoundNumber,
			"location":    nextLocation,
		},
	}
	h.broadcast <- roundStartMsg
	log.Printf("Started Round %d in Room %s", nextRoundNumber, roomID)
}

// Example: End the game
func (h *Hub) EndGame(roomID string) {
	// TODO: Calculate final results, save to DB, notify players
	log.Printf("Game ended in Room %s", roomID)
	gameOverMsg := Message{
		Type:   "game_over",
		RoomID: roomID,
		Payload: map[string]interface{}{
			"message":     "Game Over! Final Scores placeholder.",
			"finalScores": []map[string]interface{}{{"userId": 1, "totalScore": 8500}}, // Example
		},
	}
	h.broadcast <- gameOverMsg

	// Optionally clean up the room after a delay
	go func() {
		time.Sleep(30 * time.Second)
		h.mu.Lock()
		delete(h.rooms, roomID)
		h.mu.Unlock()
		log.Printf("Room %s cleaned up after game end.", roomID)
	}()
}

// --- MOCK DATA (Remove/Replace) ---
var MOCK_LOCATION = map[string]float64{"lat": 51.5, "lng": -0.1}
var MOCK_IS_GAME_OVER = false

```

```go
// internal/websocket/client.go
package websocket

import (
	"bytes"
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 1024 // Increased message size
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan Message // Changed to Message struct

	// User ID associated with this client
	UserID uint

	// Room the client is currently in
	room *Room
}

// readPump pumps messages from the websocket connection to the hub.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error (Client %d): %v", c.UserID, err)
			} else {
				log.Printf("WebSocket closed normally (Client %d): %v", c.UserID, err)
			}
			break
		}
		messageBytes = bytes.TrimSpace(bytes.Replace(messageBytes, newline, space, -1))

		// --- Parse JSON message ---
		var msg Message
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Printf("Error unmarshalling message from client %d: %v. Message: %s", c.UserID, err, string(messageBytes))
			// Send an error back to the client?
			c.send <- Message{Type: "error", Payload: "Invalid message format"}
			continue
		}

		msg.UserID = c.UserID // Ensure UserID is set from the authenticated client

		// --- Handle different message types ---
		switch msg.Type {
		case "join_room":
			if roomID, ok := msg.Payload.(string); ok {
				log.Printf("Received join_room request from %d for room %s", c.UserID, roomID)
				c.hub.JoinRoom(c, roomID)
			} else {
				log.Printf("Invalid join_room payload from %d: %v", c.UserID, msg.Payload)
				c.send <- Message{Type: "error", Payload: "Invalid room ID format for join_room"}
			}
		case "make_guess":
			if guessData, ok := msg.Payload.(map[string]interface{}); ok {
				// Ensure room context exists
				if c.room != nil {
					msg.RoomID = c.room.ID // Add room context for handler
					c.hub.HandleGuess(c, guessData)
				} else {
					c.send <- Message{Type: "error", Payload: "Cannot make guess, not in a room."}
				}
			} else {
				log.Printf("Invalid make_guess payload from %d: %v", c.UserID, msg.Payload)
				c.send <- Message{Type: "error", Payload: "Invalid guess data format"}
			}
		// Add more cases for other client actions (e.g., chat messages, requests)
		default:
			log.Printf("Received unknown message type '%s' from client %d", msg.Type, c.UserID)
			// Optionally, echo back or broadcast generic messages if needed
			// if c.room != nil {
			//   msg.RoomID = c.room.ID
			//   c.hub.broadcast <- msg
			// }
		}
		// -----------------------------
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				log.Printf("Hub closed channel for client %d.", c.UserID)
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// --- Marshal Message struct to JSON ---
			msgBytes, err := json.Marshal(message)
			if err != nil {
				log.Printf("Error marshalling message for client %d: %v", c.UserID, err)
				continue // Skip sending this message
			}
			// --------------------------------------

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				log.Printf("Error getting writer for client %d: %v", c.UserID, err)
				return
			}
			// w.Write(message) // Original code sent raw bytes
			w.Write(msgBytes) // Send marshalled JSON

			// Add queued chat messages to the current websocket message.
			// n := len(c.send)
			// for i := 0; i < n; i++ {
			//  // This part needs modification if you have queued messages that aren't part of the primary message
			//  // w.Write(newline)
			//  // w.Write(<-c.send)
			// }

			if err := w.Close(); err != nil {
				log.Printf("Error closing writer for client %d: %v", c.UserID, err)
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("Error sending ping to client %d: %v", c.UserID, err)
				return
			}
		}
	}
}

// ServeWs handles websocket requests from the peer.
func ServeWs(hub *Hub, c *gin.Context, userID uint, roomID string) { // <<< Added userID and roomID
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan Message, 256), // Buffered channel for Message struct
		UserID: userID,
		// Room is set when the client sends a 'join' message
	}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()

	log.Printf("WebSocket connection established for User %d (intended room: %s)", userID, roomID)
	// Inform client connection is ready, maybe wait for join message
	client.send <- Message{Type: "connected", Payload: "Connection successful. Send 'join_room' message."}
}

```

**2. Modify WebSocket Endpoint (`cmd/server/main.go`)**

Update the `/game/ws` handler to authenticate and extract necessary info.

```go
// cmd/server/main.go
// ... (imports)

func main() {
	// ... (initial setup: godotenv, jwt, db, hub)

	// --- Inside main function, before router setup ---
	// Store hub globally or pass it appropriately
	globalHub := hub // Assuming hub is initialized earlier

	router := gin.Default()
	// ... (CORS setup)
	// ... (Swagger setup)

	api := router.Group("/api/v1")
	{
		authGroup := api.Group("/auth")
		// ... (auth routes)

		gameGroup := api.Group("/game")
		// Apply AuthRequired middleware to non-WS routes
		gameGroup.Use(internalMiddleware.AuthRequired())
		{
			// Modify StartGame or add a new CreateGame endpoint
			// gameGroup.GET("/start", handlers.StartGame) // Keep for single player?
			gameGroup.POST("/create", handlers.CreateMultiplayerGame) // New endpoint for MP
			gameGroup.POST("/finish", handlers.FinishGame) // Likely only for SP now
		}

		// WebSocket endpoint - Auth needs special handling
		api.GET("/game/ws", func(c *gin.Context) {
			// 1. Authentication (Query Param Method - Simpler)
			tokenString := c.Query("token")
			if tokenString == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Auth token required in query param 'token'"})
				c.Abort()
				return
			}
			token, err := utils.ValidateToken(tokenString)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
				c.Abort()
				return
			}
			userID, err := utils.ExtractUserIDFromToken(token)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
				c.Abort()
				return
			}

			// 2. Get Game/Room ID (e.g., from query param)
			gameID := c.Query("gameId")
			if gameID == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'gameId' is required"})
				c.Abort()
				return
			}

			// Check if room exists (optional pre-check)
			globalHub.mu.RLock()
			_, roomExists := globalHub.rooms[gameID]
			globalHub.mu.RUnlock()
			if !roomExists {
				// Decide: auto-create or reject? Let's reject for now. Join requires existing room.
				c.JSON(http.StatusNotFound, gin.H{"error": "Game room not found"})
				c.Abort()
				return
			}

			// 3. Upgrade connection and serve
			websocket.ServeWs(globalHub, c, userID, gameID) // Pass hub, context, user ID, and intended game ID
		})

	} // end /api/v1 group

	// ... (ping route, router.Run)
}
```

**3. Add Multiplayer Game Handler (`internal/handlers/game_handler.go`)**

Create a new endpoint to specifically create multiplayer games.

```go
// internal/handlers/game_handler.go
package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	// ... other imports
	"geoguessr-backend/internal/websocket" // Import websocket package
	"github.com/google/uuid"             // For unique game IDs
)

// Assuming you have a global or passed-in Hub instance
var wsHub *websocket.Hub // Needs to be initialized/set from main.go

// SetHub allows main.go to inject the hub instance
func SetHub(h *websocket.Hub) {
	wsHub = h
}

// CreateMultiplayerGame godoc
// @Summary      Create a new multiplayer game
// @Description  Creates a new game session, generates a unique ID, and sets up a WebSocket room.
// @Tags         Game
// @Produce      json
// @Param        rounds query int false "Number of rounds (default: 5)" mininum(1) maximum(10)
// @Success      201 {object} map[string]interface{} "Multiplayer game created successfully (returns gameId)"
// @Failure      401 {object} map[string]string "Unauthorized (invalid/missing token)"
// @Failure      500 {object} map[string]string "Internal server error"
// @Security     BearerAuth
// @Router       /game/create [post]
func CreateMultiplayerGame(c *gin.Context) {
	userIDAny, _ := c.Get("userID") // From AuthRequired middleware
	userID := userIDAny.(uint)
	log.Printf("Handler: CreateMultiplayerGame invoked by User %d", userID)

	if wsHub == nil {
		log.Println("Error: WebSocket Hub not initialized in handler")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
		return
	}

	roundsStr := c.DefaultQuery("rounds", strconv.Itoa(defaultRounds))
	rounds, err := strconv.Atoi(roundsStr)
	if err != nil || rounds <= 0 || rounds > 10 {
		rounds = defaultRounds
	}

	db := database.GetDB()
	var locations []models.Location

	// Fetch locations for the game
	result := db.Model(&models.Location{}).Order("RANDOM()").Limit(rounds).Find(&locations)
	if result.Error != nil || len(locations) < rounds {
		log.Printf("Error fetching locations for multiplayer game: %v (found %d)", result.Error, len(locations))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch locations for the game"})
		return
	}

	// Generate a unique Game ID
	gameID := uuid.New().String()[:8] // Short unique ID

	// TODO: Create a proper initial game state struct
	initialGameState := map[string]interface{}{
		"status":       "waiting", // Waiting for players
		"maxRounds":    rounds,
		"currentRound": 0,
		"locations":    locations, // Store locations in server state
		"players":      make(map[uint]models.PlayerState), // Map UserID to player state
		"creatorId":    userID,
	}

	// Create the WebSocket room
	_, err = wsHub.CreateRoom(gameID, initialGameState)
	if err != nil {
		log.Printf("Error creating WebSocket room %s: %v", gameID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create game room"})
		return
	}

	// Optionally, persist the game metadata in the database
	newGame := models.Game{
		UserID:       userID, // Creator
		IsMultiplayer: true,
		GameCode:     gameID,
		RoundsPlayed: rounds, // Max rounds for this game
		// Status field could be useful: "waiting", "active", "finished"
	}
	if err := db.Create(&newGame).Error; err != nil {
		log.Printf("Error saving multiplayer game metadata to DB for game %s: %v", gameID, err)
		// Proceed even if DB save fails for now? Or rollback room creation?
		// For simplicity, we'll proceed but log the error.
	}

	log.Printf("Multiplayer game created with ID: %s by User %d", gameID, userID)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Multiplayer game created successfully",
		"gameId":  gameID,
	})
}

// Placeholder for player state within game state
// You might want to move this to internal/models
type PlayerState struct {
	Username   string `json:"username"`
	TotalScore int    `json:"totalScore"`
	// Add current round guess, etc.
}

```

**4. Update Models (`internal/models/`)**

Add fields to support multiplayer.

```go
// internal/models/game.go
package models

import (
	"time"
	// "gorm.io/datatypes" // If storing complex state as JSON in DB
)

type Game struct {
	ID            uint      `gorm:"primaryKey"`
	UserID        uint      `gorm:"not null;index"` // Foreign key to User table (Creator in MP)
	User          User      // GORM association
	TotalScore    int       // For single player or maybe final score summary
	RoundsPlayed  int       `gorm:"not null"` // Max rounds for the game
	CreatedAt     time.Time
	UpdatedAt     time.Time

	// --- Multiplayer Fields ---
	IsMultiplayer bool   `gorm:"default:false;index"`
	GameCode      string `gorm:"size:12;index;unique"` // Unique ID for joining MP games (e.g., short UUID)
	// Status        string `gorm:"size:20;default:'waiting'"` // e.g., waiting, active, finished
	// GameStateJSON datatypes.JSON // Optional: Store dynamic game state blob in DB

	Rounds []Round `gorm:"foreignKey:GameID"` // Rounds definition for the game
}

// --- You might need a NEW struct for player-specific round results in MP ---
type UserRoundGuess struct {
	ID         uint    `gorm:"primaryKey"`
	GameID     uint    `gorm:"not null;index"` // Link to the main Game record
	UserID     uint    `gorm:"not null;index"` // Link to the User who made the guess
	RoundNumber int    `gorm:"not null"`      // Which round this guess belongs to
	LocationID uint    `gorm:"not null"`      // The actual location ID for the round
	GuessLat   float64 `gorm:"not null"`
	GuessLng   float64 `gorm:"not null"`
	DistanceKm float64
	Score      int `gorm:"not null"`
	CreatedAt  time.Time
	// Add Game   Game `gorm:"foreignKey:GameID"` if needed
	// Add User   User `gorm:"foreignKey:UserID"` if needed
}


// PlayerState for in-memory representation in WebSocket Hub/Room
type PlayerState struct {
	UserID     uint                   `json:"userId"`
	Username   string                 `json:"username"`
	TotalScore int                    `json:"totalScore"`
	Guesses    map[int]PlayerRoundGuess `json:"guesses"` // Map round number to guess details
	IsOnline   bool                   `json:"isOnline"`
}
type PlayerRoundGuess struct {
	GuessLat   float64 `json:"guessLat"`
	GuessLng   float64 `json:"guessLng"`
	DistanceKm float64 `json:"distanceKm"`
	Score      int     `json:"score"`
	Submitted  bool    `json:"submitted"`
}

// MultiplayerGameState for in-memory representation in WebSocket Hub/Room
type MultiplayerGameState struct {
	Status        string                 `json:"status"` // waiting, active, round_end, finished
	MaxRounds     int                    `json:"maxRounds"`
	CurrentRound  int                    `json:"currentRound"`
	Locations     []Location             `json:"-"` // Don't send all locations initially
	CurrentLocation *Location            `json:"currentLocation"` // Only send current round's location
	Players       map[uint]*PlayerState `json:"players"` // Map UserID to player state
	CreatorID     uint                   `json:"creatorId"`
	RoundEndTime  time.Time              `json:"roundEndTime,omitempty"` // Optional: Timer for rounds
	// Maybe store round results temporarily here too
}

```

**5. Pass Hub Instance in `main.go`**

Ensure the hub created in `main` is accessible to the handlers.

```go
// cmd/server/main.go

// ... imports ...
import (
	// ...
	"geoguessr-backend/internal/handlers"
	"geoguessr-backend/internal/websocket" // Ensure websocket is imported
)

func main() {
	// ...
	hub := websocket.NewHub()
	go hub.Run()
	handlers.SetHub(hub) // <<< Inject Hub into handlers package
	// ...
}

```

---

**Frontend Changes**

**1. Create Multiplayer Lobby View (`src/views/MultiplayerLobby.vue`)**

A new view for creating or joining multiplayer games.

```vue
// src/views/MultiplayerLobby.vue
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Multiplayer Lobby</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Create Game Card -->
      <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 class="text-2xl font-semibold mb-4 text-blue-600">Create a New Game</h2>
        <p class="text-gray-600 mb-6">Start a new multiplayer game and invite your friends!</p>
        <button @click="createGame" :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50">
          <svg v-if="isLoading && action === 'create'" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ isLoading && action === 'create' ? 'Creating...' : 'Create Game' }}
        </button>
      </div>

      <!-- Join Game Card -->
      <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 class="text-2xl font-semibold mb-4 text-green-600">Join an Existing Game</h2>
        <p class="text-gray-600 mb-4">Enter the Game ID provided by your friend.</p>
        <form @submit.prevent="joinGame">
          <input v-model="joinGameId" type="text" placeholder="Enter Game ID (e.g., abc123xy)"
            class="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            required maxlength="8" />
          <button type="submit" :disabled="isLoading || !joinGameId"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50">
            <svg v-if="isLoading && action === 'join'" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ isLoading && action === 'join' ? 'Joining...' : 'Join Game' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <!-- Loading Games List (Optional) -->
    <!-- <div class="mt-12">
          <h2 class="text-2xl font-semibold mb-4">Available Games</h2>
          <-- List available public games here -->
    <!-- </div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Use a configured instance if available
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore'; // Import GameStore

const router = useRouter();
const authStore = useAuthStore();
const gameStore = useGameStore(); // Use GameStore
const isLoading = ref(false);
const error = ref(null);
const joinGameId = ref('');
const action = ref(''); // To track which button is loading

// --- Axios instance specific for multiplayer game creation ---
// You might centralize this in your api service file
const mpApiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Your Go backend address + API prefix
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor for this instance too
mpApiClient.interceptors.request.use(
  (config) => {
    const token = authStore.authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// -----------------------------------------------------------

async function createGame() {
  if (!authStore.isAuthenticated) {
    error.value = "Please log in to create a game.";
    router.push('/login');
    return;
  }
  isLoading.value = true;
  action.value = 'create';
  error.value = null;

  try {
    // Use the dedicated mpApiClient with auth
    const response = await mpApiClient.post('/game/create'); // Call the new backend endpoint
    const newGameId = response.data.gameId;
    console.log('Game created with ID:', newGameId);
    gameStore.setMultiplayerGame(newGameId); // <<< SET MP STATE IN STORE
    router.push(`/game/${newGameId}`); // Navigate to the game view with the ID
  } catch (err) {
    console.error('Error creating game:', err);
    error.value = err.response?.data?.error || 'Failed to create game. Please try again.';
  } finally {
    isLoading.value = false;
    action.value = '';
  }
}

async function joinGame() {
  if (!joinGameId.value) {
    error.value = "Please enter a Game ID.";
    return;
  }
  if (!authStore.isAuthenticated) {
    error.value = "Please log in to join a game.";
    router.push('/login');
    return;
  }
  isLoading.value = true;
  action.value = 'join';
  error.value = null;

  // Basic validation or check if game exists via API (optional)
  // For now, just try navigating and let the GameView handle connection
  try {
    // Simulate check or just navigate
    console.log('Attempting to join game:', joinGameId.value);
    gameStore.setMultiplayerGame(joinGameId.value); // <<< SET MP STATE IN STORE
    router.push(`/game/${joinGameId.value}`);
    // Error handling will mostly happen in GameView's WebSocket connection attempt
  } catch (err) {
    error.value = "Failed to navigate to game."; // Generic error for now
  } finally {
    isLoading.value = false;
    action.value = '';
  }
}
</script>

```

**2. Add Routing (`src/router/index.js`)**

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import MultiplayerLobby from '../views/MultiplayerLobby.vue'; // <<< Import Lobby
import { useAuthStore } from '../stores/authStore';


const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/lobby', name: 'MultiplayerLobby', component: MultiplayerLobby, meta: { requiresAuth: true } }, // <<< Add Lobby route
  // GameView now handles both SP and MP. MP uses the gameId param.
  { path: '/game/:gameId?', name: 'Game', component: GameView, props: true, meta: { requiresAuth: true } }, // <<< Modified Game route
  { path: '/login', name: 'Login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { guestOnly: true } },
  // Add routes for Profile, Leaderboard later
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// --- Navigation Guards (Keep as is) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);
  const isAuthenticated = authStore.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log('Redirecting to /login (auth required)');
    next({ name: 'Login', query: { redirect: to.fullPath } }); // Pass intended destination
  } else if (guestOnly && isAuthenticated) {
    console.log('Redirecting to / (already authenticated)');
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;

```

**3. Create WebSocket Service (`src/services/websocketService.js`)**

```javascript
// src/services/websocketService.js
import { ref } from 'vue';

const socket = ref(null);
const connectionStatus = ref('disconnected'); // disconnected, connecting, connected, error
const listeners = ref({
    message: [],
    error: [],
    open: [],
    close: [],
});
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

function connect(gameId, token) {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        console.warn('WebSocketService: Already connected.');
        return;
    }
    if (connectionStatus.value === 'connecting') {
         console.warn('WebSocketService: Connection attempt already in progress.');
        return;
    }

    if (!gameId || !token) {
        console.error("WebSocketService: Game ID and Token are required to connect.");
        connectionStatus.value = 'error';
        triggerEvent('error', 'Missing Game ID or Token');
        return;
    }

    // Construct WebSocket URL (adjust ws/wss based on environment)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//localhost:8080/api/v1/game/ws?gameId=${encodeURIComponent(gameId)}&token=${encodeURIComponent(token)}`;

    console.log(`WebSocketService: Connecting to ${wsUrl}...`);
    connectionStatus.value = 'connecting';
    triggerEvent('status', 'connecting'); // Notify listeners about status change

    try {
        socket.value = new WebSocket(wsUrl);

        socket.value.onopen = () => {
            console.log('WebSocketService: Connection established.');
            connectionStatus.value = 'connected';
            reconnectAttempts = 0; // Reset on successful connection
            triggerEvent('open');
            triggerEvent('status', 'connected');
        };

        socket.value.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                // console.log('WebSocketService: Message received:', message);
                triggerEvent('message', message);
            } catch (e) {
                console.error('WebSocketService: Error parsing message:', e, event.data);
                triggerEvent('error', 'Failed to parse server message');
            }
        };

        socket.value.onerror = (event) => {
            console.error('WebSocketService: Error:', event);
            connectionStatus.value = 'error';
            triggerEvent('error', 'WebSocket connection error');
            triggerEvent('status', 'error');
            // Don't attempt reconnect on initial error? Or maybe try once?
        };

        socket.value.onclose = (event) => {
            console.log(`WebSocketService: Connection closed. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
            const previousStatus = connectionStatus.value;
            connectionStatus.value = 'disconnected';
            socket.value = null; // Clear socket ref

            // Trigger close event *before* attempting reconnect
             triggerEvent('close', { code: event.code, reason: event.reason, wasClean: event.wasClean });
             triggerEvent('status', 'disconnected');


            // Attempt reconnect only if not a clean close or if desired
            if (!event.wasClean && previousStatus !== 'error' && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`WebSocketService: Attempting reconnect ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
                 triggerEvent('status', `reconnecting (${reconnectAttempts})`);
                setTimeout(() => connect(gameId, token), RECONNECT_DELAY * reconnectAttempts); // Exponential backoff?
            } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.error('WebSocketService: Max reconnect attempts reached.');
                 triggerEvent('error', 'Connection lost. Max reconnect attempts reached.');
                 triggerEvent('status', 'error');
            }
        };

    } catch (error) {
         console.error('WebSocketService: Failed to initialize WebSocket:', error);
         connectionStatus.value = 'error';
         triggerEvent('error', 'Failed to initialize WebSocket');
         triggerEvent('status', 'error');
    }
}

function disconnect() {
    if (socket.value) {
        console.log('WebSocketService: Disconnecting...');
        // Prevent automatic reconnection attempts when manually closing
        reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Set to max to prevent reconnect loop
        socket.value.close(1000, 'Client initiated disconnect'); // Use normal closure code
        // onclose handler will set socket.value to null
    }
}

function sendMessage(messageObject) {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        try {
            // console.log('WebSocketService: Sending:', messageObject);
            socket.value.send(JSON.stringify(messageObject));
        } catch (e) {
            console.error('WebSocketService: Error sending message:', e);
            triggerEvent('error', 'Failed to send message');
        }
    } else {
        console.warn('WebSocketService: Cannot send message, socket not open.');
        triggerEvent('error', 'Cannot send message, connection not open.');
    }
}

// --- Event Listener Management ---
function onMessage(callback) {
    listeners.value.message.push(callback);
    return () => removeListener('message', callback); // Return unsubscribe function
}
function onError(callback) {
    listeners.value.error.push(callback);
     return () => removeListener('error', callback);
}
function onOpen(callback) {
    listeners.value.open.push(callback);
     return () => removeListener('open', callback);
}
function onClose(callback) {
    listeners.value.close.push(callback);
     return () => removeListener('close', callback);
}
// Special listener for status changes
function onStatusChange(callback) {
    listeners.value.status = listeners.value.status || []; // Ensure status array exists
    listeners.value.status.push(callback);
    // Immediately call with current status
    callback(connectionStatus.value);
    return () => removeListener('status', callback);
}


function removeListener(type, callback) {
    if (listeners.value[type]) {
         listeners.value[type] = listeners.value[type].filter(cb => cb !== callback);
    }
}

function triggerEvent(type, data) {
     if (listeners.value[type]) {
        // Create a copy to avoid issues if a listener unsubscribes during iteration
        [...listeners.value[type]].forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`WebSocketService: Error in ${type} listener:`, e);
            }
        });
    }
}

// --- Export Service ---
export const websocketService = {
    connect,
    disconnect,
    sendMessage,
    onMessage,
    onError,
    onOpen,
    onClose,
    onStatusChange, // Expose status listener
    // Expose status reactive ref for direct use in components if needed
    // (use with caution, prefer event listeners)
    status: connectionStatus,
};

```

**4. Update Game Store (`src/stores/GameStore.js`)**

Integrate WebSocket service and handle multiplayer state.

```javascript
// src/stores/gameStore.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import gameService from '../services/gameService';
import { websocketService } from '../services/websocketService'; // <<< Import WebSocket service
import { useAuthStore } from './authStore'; // Import auth store for token

// ... (keep calculateDistance, deg2rad, calculateScore helpers) ...

export const useGameStore = defineStore('game', () => {
    // --- Existing State ---
    const isMapsApiReady = ref(false);
    const gameId = ref(null); // Holds SP game ID or MP game ID/code
    const currentRound = ref(0);
    const totalScore = ref(0); // User's total score
    const locations = ref([]);
    const currentGuess = ref(null);
    const roundResults = ref([]); // Holds *this user's* results for each round
    const isRoundActive = ref(false);
    const isGameOver = ref(false);
    const isLoading = ref(false); // General loading state
    const gameError = ref(null);
    const MAX_ROUNDS = 5; // Default max rounds

    // --- Multiplayer State ---
    const isMultiplayer = ref(false);
    const players = ref({}); // Map: { userId: { username, totalScore, isOnline, currentGuess? } }
    const currentRoundData = ref(null); // Holds data for the current round from WS (location, number)
    const currentRoundResultsMP = ref(null); // Holds results for all players for the ended round from WS
    const wsStatus = ref('disconnected'); // Track WebSocket connection status
    const wsError = ref(null); // Track WebSocket errors

    // --- Auth Store ---
    const authStore = useAuthStore();
    const currentUserId = computed(() => authStore.userProfile?.id);
    const currentUsername = computed(() => authStore.userProfile?.username);

    // --- WebSocket Unsubscribe Functions ---
    let unsubscribeWsMessage = null;
    let unsubscribeWsError = null;
    let unsubscribeWsOpen = null;
    let unsubscribeWsClose = null;
    let unsubscribeWsStatus = null;


    // --- Getters (Computed) ---
    const getCurrentLocation = computed(() => {
        // In MP, location comes from currentRoundData via WebSocket
        if (isMultiplayer.value) {
            return currentRoundData.value?.location || null;
        }
        // In SP, use the pre-fetched locations array
        if (currentRound.value > 0 && currentRound.value <= locations.value.length) {
            const loc = locations.value[currentRound.value - 1];
            return { id: loc.id, lat: loc.lat, lng: loc.lng };
        }
        return null;
    });

     const getCurrentRoundResult = computed(() => {
        // SP: Find this user's result for the current round
        if (!isMultiplayer.value) {
           return roundResults.value.find(r => r.round === currentRound.value) || null;
        }
        // MP: Get the results blob received at round end
        // This might need refinement depending on how you want to display MP results
        return currentRoundResultsMP.value || null;
    });

    const hasSubmittedGuessForCurrentRound = computed(() => {
         if (!isMultiplayer.value) {
             // SP: check if a result exists for the current round in the local results array
             return roundResults.value.some(r => r.round === currentRound.value);
         } else {
             // MP: check if the current user's state in the `players` map indicates a submitted guess for the active round
             const myPlayerState = players.value[currentUserId.value];
             // We need a way to know the *active* round number even before results come in
             // Let's assume currentRoundData holds the active round number
             const activeRoundNum = currentRoundData.value?.roundNumber;
             return !!(myPlayerState?.guesses && activeRoundNum && myPlayerState.guesses[activeRoundNum]?.submitted);
         }
     });

    // --- Actions ---
    function setMapsApiReady(value) {
        console.log(`Store: Setting Maps API Ready to ${value}`);
        isMapsApiReady.value = value;
    }

    function clearGameError() {
        gameError.value = null;
        wsError.value = null; // Clear WS errors too
    }

    // Called from Lobby to set MP mode
    function setMultiplayerGame(mpGameId) {
        isMultiplayer.value = true;
        gameId.value = mpGameId; // Store the multiplayer game ID
        // Reset other relevant states if needed
        resetGameState();
    }

    function resetGameState() {
        gameId.value = null;
        currentRound.value = 0;
        totalScore.value = 0;
        locations.value = [];
        currentGuess.value = null;
        roundResults.value = [];
        isRoundActive.value = false;
        isGameOver.value = false;
        isLoading.value = false;
        gameError.value = null;
        isMultiplayer.value = false;
        players.value = {};
        currentRoundData.value = null;
        currentRoundResultsMP.value = null;
        wsStatus.value = 'disconnected';
        wsError.value = null;

        // Disconnect WebSocket if connected
        disconnectWebSocket();
    }

    // --- Single Player Game Start ---
    async function startSinglePlayerGame() {
        if (!isMapsApiReady.value) {
            gameError.value = "Maps API is still loading. Please wait.";
            return;
        }
        resetGameState(); // Reset before starting
        isMultiplayer.value = false; // Ensure SP mode

        isLoading.value = true;
        try {
            const gameData = await gameService.startGame(MAX_ROUNDS);
            if (!gameData || !gameData.locations || gameData.locations.length === 0) {
                throw new Error("Received invalid game data from server.");
            }
            gameId.value = gameData.gameId; // Use temporary ID for SP
            locations.value = gameData.locations;
            console.log(`Store: Single Player Game ${gameId.value} started, ${locations.value.length} locations loaded.`);
            await nextRound(); // Start the first round
        } catch (error) {
            console.error("Store: Error starting SP game:", error.message);
            gameError.value = "Failed to start new game. Please try again later.";
            isGameOver.value = true;
            locations.value = [];
            gameId.value = null;
        } finally {
            isLoading.value = false;
        }
    }

    // --- WebSocket Connection Management ---
    function connectWebSocket() {
        if (!isMultiplayer.value || !gameId.value) {
            console.error("Store: Cannot connect WebSocket, not a multiplayer game or no game ID.");
            return;
        }
        const token = authStore.authToken;
        if (!token) {
            console.error("Store: Cannot connect WebSocket, user not authenticated.");
            wsError.value = "Authentication required to connect.";
            wsStatus.value = 'error';
            return;
        }
        clearGameError(); // Clear previous errors

        // Ensure previous listeners are removed before reconnecting
        disconnectWebSocket();

        wsStatus.value = 'connecting';
        websocketService.connect(gameId.value, token);

        // Setup new listeners
        unsubscribeWsOpen = websocketService.onOpen(() => {
            console.log("Store: WebSocket connected.");
            wsStatus.value = 'connected';
            wsError.value = null;
            // Client now needs to send a "join_room" message type
            // We can do this automatically on connect here
            websocketService.sendMessage({ type: "join_room", payload: gameId.value });
        });

        unsubscribeWsMessage = websocketService.onMessage(handleWebSocketMessage);

        unsubscribeWsError = websocketService.onError((error) => {
            console.error("Store: WebSocket error:", error);
            wsError.value = error || "WebSocket connection error.";
            wsStatus.value = 'error';
            // Maybe trigger UI update
        });

        unsubscribeWsClose = websocketService.onClose((event) => {
            console.log("Store: WebSocket closed.", event);
            wsStatus.value = 'disconnected';
             // Don't nullify game state here, just reflect connection loss
             // Reconnection logic is handled within the service
             if (!event.wasClean) {
                wsError.value = `Connection closed unexpectedly (Code: ${event.code}). Attempting to reconnect...`;
             }
        });

        unsubscribeWsStatus = websocketService.onStatusChange((status) => {
            wsStatus.value = status;
            if (status === 'error' && !wsError.value) {
                wsError.value = 'WebSocket connection failed.';
            } else if (status === 'connected') {
                 wsError.value = null; // Clear error on successful connect/reconnect
            }
        });
    }

    function disconnectWebSocket() {
        console.log("Store: Cleaning up WebSocket listeners and disconnecting.");
        // Unsubscribe from all events
        unsubscribeWsMessage?.(); unsubscribeWsMessage = null;
        unsubscribeWsError?.(); unsubscribeWsError = null;
        unsubscribeWsOpen?.(); unsubscribeWsOpen = null;
        unsubscribeWsClose?.(); unsubscribeWsClose = null;
        unsubscribeWsStatus?.(); unsubscribeWsStatus = null;

        // Explicitly disconnect
        websocketService.disconnect();
        wsStatus.value = 'disconnected'; // Ensure status is updated
    }

    // --- WebSocket Message Handling ---
    function handleWebSocketMessage(message) {
        console.log("Store: Received WS Message:", message.type, message.payload);
        switch (message.type) {
            case 'connected':
                // Server confirms connection, client should now send join_room
                // (We send join_room onopen now, so this might just be informational)
                break;
            case 'error':
                wsError.value = message.payload || 'Received error from server.';
                break;
            case 'game_state': // Initial state on joining
            case 'player_update': // General update (could combine player join/left/score)
                updateGameState(message.payload);
                break;
            case 'player_joined':
                 handlePlayerJoined(message.payload);
                break;
            case 'player_left':
                 handlePlayerLeft(message.payload);
                break;
            case 'round_start':
                handleRoundStart(message.payload);
                break;
            case 'round_end':
                handleRoundEnd(message.payload);
                break;
             case 'guess_received': // Someone (maybe you) made a guess
                 handleGuessReceived(message.payload);
                 break;
            case 'game_over':
                handleGameOver(message.payload);
                break;
            default:
                console.warn("Store: Received unhandled WS message type:", message.type);
        }
    }

     function updateGameState(payload) {
         // Comprehensive update - replace local state with server state
         console.log("Updating full game state:", payload);
         if (payload.players) players.value = payload.players; // Update player map
         if (payload.currentRound) currentRound.value = payload.currentRound;
         if (payload.currentLocation) currentRoundData.value = { roundNumber: payload.currentRound, location: payload.currentLocation };
         if (payload.status === 'active' || payload.status === 'round_end') {
             isRoundActive.value = payload.status === 'active';
             isLoading.value = false; // Assume loading is done if we get state
             isGameOver.value = false;
         }
          // Update individual player scores if included
        if (payload.players && currentUserId.value && payload.players[currentUserId.value]) {
            totalScore.value = payload.players[currentUserId.value].totalScore;
        }
     }

    function handlePlayerJoined(payload) {
        console.log("Player joined:", payload);
        if (payload.userId && !players.value[payload.userId]) {
             players.value[payload.userId] = {
                userId: payload.userId,
                username: payload.username || `User_${payload.userId}`,
                totalScore: payload.totalScore || 0,
                isOnline: true,
                guesses: {}
             };
        } else if (payload.userId) {
            // Player reconnected? Update online status.
            players.value[payload.userId].isOnline = true;
            if(payload.username) players.value[payload.userId].username = payload.username;
        }
    }

    function handlePlayerLeft(payload) {
         console.log("Player left:", payload);
         if (payload.userId && players.value[payload.userId]) {
             // Option 1: Mark as offline
             players.value[payload.userId].isOnline = false;
             // Option 2: Remove player (simpler for now)
             // delete players.value[payload.userId];
         }
    }

    function handleRoundStart(payload) {
        console.log("Starting round:", payload);
        currentRound.value = payload.roundNumber;
        currentRoundData.value = payload; // Store location etc.
        currentGuess.value = null; // Clear previous guess marker selection
        isRoundActive.value = true;
        isGameOver.value = false;
        isLoading.value = false; // Round is ready
        currentRoundResultsMP.value = null; // Clear results from previous round
         // Reset submitted status for all players for this new round
         Object.values(players.value).forEach(p => {
            if (!p.guesses) p.guesses = {};
            p.guesses[currentRound.value] = { submitted: false };
         });
    }

     function handleGuessReceived(payload) {
        // Someone made a guess, update their state
        const guessingPlayerId = payload.userId;
        if (players.value[guessingPlayerId] && currentRoundData.value) {
            const roundNum = currentRoundData.value.roundNumber;
            if (!players.value[guessingPlayerId].guesses) {
                 players.value[guessingPlayerId].guesses = {};
            }
            players.value[guessingPlayerId].guesses[roundNum] = {
                ...(players.value[guessingPlayerId].guesses[roundNum] || {}), // Keep existing data if any
                guessLat: payload.guess?.lat, // Assuming payload structure
                guessLng: payload.guess?.lng,
                submitted: true // Mark as submitted
            };
            // Trigger reactivity if needed manually (usually not necessary with ref)
            // players.value = { ...players.value };
             console.log(`Guess recorded for player ${guessingPlayerId} in round ${roundNum}`);

              // Check if it was *my* guess to update local state if needed
            if (guessingPlayerId === currentUserId.value) {
                 console.log("My guess was successfully received by the server.");
                // UI should already reflect submission based on `hasSubmittedGuessForCurrentRound`
            }
        }
     }


    function handleRoundEnd(payload) {
        console.log("Round ended:", payload);
        isRoundActive.value = false;
        isLoading.value = false; // Finished processing round end
        currentRoundResultsMP.value = payload.results; // Store results for display

        // Update total scores for all players
        if (payload.scores) {
            payload.scores.forEach(scoreUpdate => {
                if (players.value[scoreUpdate.userId]) {
                    players.value[scoreUpdate.userId].totalScore = scoreUpdate.totalScore;
                     // Update local user's score too
                    if (scoreUpdate.userId === currentUserId.value) {
                        totalScore.value = scoreUpdate.totalScore;
                    }
                }
            });
        }
         // Optionally, update player round details based on results
         if (payload.results) {
             payload.results.forEach(result => {
                 if (players.value[result.userId] && players.value[result.userId].guesses[currentRound.value]) {
                    players.value[result.userId].guesses[currentRound.value].score = result.score;
                    players.value[result.userId].guesses[currentRound.value].distanceKm = result.distance;
                 }
             });
         }
    }

    function handleGameOver(payload) {
        console.log("Game over:", payload);
        isGameOver.value = true;
        isRoundActive.value = false;
        isLoading.value = false;
        // Update final scores if provided
        if (payload.finalScores) {
             payload.finalScores.forEach(scoreUpdate => {
                if (players.value[scoreUpdate.userId]) {
                    players.value[scoreUpdate.userId].totalScore = scoreUpdate.totalScore;
                     if (scoreUpdate.userId === currentUserId.value) {
                        totalScore.value = scoreUpdate.totalScore;
                    }
                }
            });
        }
        disconnectWebSocket(); // Disconnect after game ends
    }

    // --- Modified/Shared Actions ---

    async function nextRound() {
        if (isGameOver.value) return;

        // SP Logic
        if (!isMultiplayer.value) {
            if (currentRound.value >= locations.value.length) {
                console.log("SP Game Over! Final Score:", totalScore.value);
                isGameOver.value = true;
                isRoundActive.value = false;
                // TODO: Submit final SP results to backend
                // await submitFinalResults();
                return;
            }
            isLoading.value = true;
            currentRound.value++;
            currentGuess.value = null;
            isRoundActive.value = true;
            console.log(`Store: Loading SP round ${currentRound.value}`);
            await new Promise(resolve => setTimeout(resolve, 100));
            isLoading.value = false;
        } else {
            // MP Logic: Round progression is controlled by the server via 'round_start' message.
            // Client might display a "Waiting for next round..." message.
            console.log("Store: Waiting for server to start next MP round.");
            isLoading.value = true; // Show loading indicator while waiting
        }
    }

    function recordGuess(guessCoords) {
        if (isRoundActive.value && !hasSubmittedGuessForCurrentRound.value) {
            currentGuess.value = guessCoords; // Keep local track for map marker
            console.log("Store: Guess recorded locally", currentGuess.value);
        }
    }

    async function submitGuess() {
        if (!currentGuess.value || !isRoundActive.value || hasSubmittedGuessForCurrentRound.value) {
            console.warn("Submit guess called in invalid state.");
            return;
        }

        const actualLocation = getCurrentLocation.value; // Works for both SP and MP now
        if (!actualLocation) {
            console.error("Cannot submit guess, actual location not found for round.");
            gameError.value = "Could not find location data for this round.";
            return;
        }

        isRoundActive.value = false; // Stop further interaction for this round locally
        isLoading.value = true; // Show loading

        // --- SP Guess Submission ---
        if (!isMultiplayer.value) {
            console.log("Store: Submitting SP guess", currentGuess.value, "for actual", actualLocation);
            const distance = calculateDistance(
                actualLocation.lat, actualLocation.lng,
                currentGuess.value.lat, currentGuess.value.lng
            );
            const score = calculateScore(distance);
            const result = {
                round: currentRound.value,
                locationId: actualLocation.id, // Include location ID
                guess: { ...currentGuess.value },
                actual: { lat: actualLocation.lat, lng: actualLocation.lng },
                distanceKm: distance,
                score: score
            };
            roundResults.value.push(result);
            totalScore.value += score;
            console.log("Store: SP Round result", result);
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
            isLoading.value = false;
            // UI will show results and "Next Round" button
        }
        // --- MP Guess Submission ---
        else {
            console.log("Store: Sending MP guess via WebSocket", currentGuess.value);
            websocketService.sendMessage({
                type: "make_guess",
                payload: {
                    lat: currentGuess.value.lat,
                    lng: currentGuess.value.lng,
                    round: currentRound.value, // Send round number for validation
                }
            });
            // Don't set isLoading false here; wait for round_end message from server
            // The UI should show a "Waiting for other players..." state
        }
    }
     // --- New action to submit final results (primarily for SP) ---
     async function submitFinalResults() {
        if (isMultiplayer.value) {
             console.warn("Attempted to submit final results for a multiplayer game from client.");
             return; // Server handles MP game end
        }
        if (!gameId.value || roundResults.value.length === 0) {
            console.error("Cannot submit final results, no game data.");
            return;
        }

        console.log("Submitting final SP game results...");
        isLoading.value = true;
        gameError.value = null;

        // Prepare data for the backend /game/finish endpoint
        const submissionData = {
            // gameId: gameId.value, // Backend might not need this if it tracks via auth
            totalScore: totalScore.value,
            roundsPlayed: roundResults.value.length,
            rounds: roundResults.value.map(r => ({
                roundNumber: r.round,
                locationId: r.locationId,
                guessLat: r.guess.lat,
                guessLng: r.guess.lng,
                actualLat: r.actual.lat,
                actualLng: r.actual.lng,
                distanceKm: r.distanceKm,
                score: r.score,
            }))
        };

        try {
            // Assume gameService needs an update for finishGame
            // const response = await gameService.finishGame(submissionData);
            // console.log("Game results submitted successfully:", response);
             // Mock success for now
             await new Promise(resolve => setTimeout(resolve, 500));
             console.log("Mock submission successful.");

        } catch (error) {
            console.error("Failed to submit game results:", error);
            gameError.value = "Could not save your game results. Please try again later.";
            // Keep isGameOver true, but allow retry? Or just inform user?
        } finally {
            isLoading.value = false;
        }
    }


    // --- Watchers ---
    // Watch for game ID changes to potentially connect WebSocket
    watch(gameId, (newId, oldId) => {
        if (newId && isMultiplayer.value) {
            connectWebSocket();
        } else if (!newId && oldId) {
            // Game ended or reset
            disconnectWebSocket();
        }
    });
     // Watch for game over state to potentially submit SP results
     watch(isGameOver, (isOver) => {
         if (isOver && !isMultiplayer.value && roundResults.value.length > 0) {
            // submitFinalResults();
         }
     });


    // --- Return state, getters, and actions ---
    return {
        // State
        isMapsApiReady, gameId, currentRound, totalScore, locations, currentGuess, roundResults, isRoundActive, isGameOver, isLoading, gameError, MAX_ROUNDS,
        isMultiplayer, players, currentRoundData, currentRoundResultsMP, wsStatus, wsError,
        // Getters
        getCurrentLocation, getCurrentRoundResult, hasSubmittedGuessForCurrentRound, currentUserId, currentUsername, // Expose user info for convenience
        // Actions
        setMapsApiReady, clearGameError, setMultiplayerGame, resetGameState, startSinglePlayerGame, /* connectWebSocket, disconnectWebSocket, */ // Internal connection logic exposed via start/reset
        nextRound, recordGuess, submitGuess, submitFinalResults,
    };
});

```

**5. Update Game View (`src/views/GameView.vue`)**

Make `GameView` handle both single-player and multiplayer modes, connect to WebSocket for MP, and display relevant UI.

```vue
// src/views/GameView.vue
<template>
  <!-- Keep the main structure, add conditional rendering for MP -->
  <div class="relative w-screen h-screen overflow-hidden bg-black">

    <!-- 1. Street View Background -->
    <div class="absolute inset-0 z-0">
      <StreetViewDisplay :location="gameStore.getCurrentLocation"
        v-if="(gameStore.gameId || gameStore.isMultiplayer) && !gameStore.isGameOver && gameStore.getCurrentLocation"
        class="w-full h-full" />
      <!-- Loading State (Generic) -->
      <div v-else-if="gameStore.isLoading || (gameStore.isMultiplayer && gameStore.wsStatus === 'connecting')"
        class="w-full h-full bg-gray-800 flex items-center justify-center">
        <div class="flex flex-col items-center text-center px-4">
           <svg class="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
             viewBox="0 0 24 24">
             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
             <path class="opacity-75" fill="currentColor"
               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
             </path>
           </svg>
           <p class="text-gray-300 text-lg">
             {{ gameStore.isMultiplayer && gameStore.wsStatus === 'connecting' ? `Connecting to game ${props.gameId}...` : 'Preparing your location...' }}
           </p>
        </div>
      </div>
       <!-- WS Error State -->
       <div v-else-if="gameStore.isMultiplayer && gameStore.wsStatus === 'error'"
         class="w-full h-full bg-red-900/50 flex items-center justify-center text-center p-4">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
            <strong class="font-bold block mb-2">Connection Error!</strong>
            <span class="block sm:inline">{{ gameStore.wsError || 'Could not connect to the game server.' }}</span>
            <button @click="attemptReconnect" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry Connection</button>
             <router-link to="/lobby" class="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 inline-block">Back to Lobby</router-link>
          </div>
       </div>
    </div>

    <!-- 2. Game Overlay UI (Static Elements) -->
    <div v-if="(gameStore.gameId || gameStore.isMultiplayer) && !gameStore.isGameOver && !isMapFullscreen"
      class="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div class="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <!-- Your Score (Always visible) -->
        <div class="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg pointer-events-auto">
          <div class="text-yellow-400 text-sm font-medium">YOUR SCORE</div>
          <div class="text-white text-xl font-bold">{{ gameStore.totalScore }}</div>
        </div>

        <!-- Multiplayer Player List (MP Only) -->
        <div v-if="gameStore.isMultiplayer"
          class="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg pointer-events-auto max-w-xs overflow-y-auto max-h-32">
          <div class="text-blue-300 text-sm font-medium mb-1">PLAYERS ({{ Object.keys(gameStore.players).length }})</div>
          <ul class="text-xs space-y-1">
            <li v-for="player in gameStore.players" :key="player.userId"
              :class="['flex justify-between items-center', player.userId === gameStore.currentUserId ? 'text-yellow-300 font-semibold' : 'text-white/90']">
              <span>
                <span class="inline-block w-2 h-2 rounded-full mr-1.5" :class="player.isOnline ? 'bg-green-500' : 'bg-gray-500'"></span>
                {{ player.username }} {{ player.userId === gameStore.currentUserId ? '(You)' : '' }}
                 <!-- Show checkmark if player submitted guess for current round -->
                 <span v-if="player.guesses && gameStore.currentRoundData && player.guesses[gameStore.currentRoundData.roundNumber]?.submitted" class="text-green-400 ml-1">✓</span>
              </span>
              <span class="font-mono">{{ player.totalScore }}</span>
            </li>
          </ul>
        </div>


        <div class="flex space-x-2 items-center">
          <!-- Round Indicator -->
          <div class="flex space-x-1">
            <div v-for="round in gameStore.MAX_ROUNDS" :key="round" :class="[
              'w-6 h-6 rounded-full flex items-center justify-center border-2',
              round < gameStore.currentRound ? 'bg-green-500 border-green-400' : // Use gameStore.currentRound
                round === gameStore.currentRound ? 'bg-blue-600 border-blue-500 animate-pulse' :
                  'bg-gray-700/70 border-gray-600'
            ]">
              <span class="text-xs font-bold text-white">{{ round }}</span>
            </div>
          </div>
           <!-- Optional Timer -->
        </div>

        <!-- Settings Button -->
        <button v-if="!gameStore.isMultiplayer" class="bg-black/70 p-2 rounded-lg hover:bg-black/90 transition-colors pointer-events-auto">
          <!-- Settings Icon -->
        </button>
      </div>
    </div>

    <!-- 3. Map Overlay -->
     <div v-if="(gameStore.gameId || gameStore.isMultiplayer) && !gameStore.isGameOver"
      class="map-container group absolute transition-all duration-300 ease-in-out border-2 overflow-hidden" :class="{
        'inset-0 z-40 border-none': isMapFullscreen || gameStore.hasSubmittedGuessForCurrentRound || (gameStore.isMultiplayer && gameStore.currentRoundResultsMP), // Stay fullscreen after MP round end
        'bottom-5 right-5 w-48 h-36 md:w-56 md:h-44 lg:w-64 lg:h-48 z-20 border-white/50 rounded-lg shadow-lg hover:w-[40vw] hover:h-[40vh] hover:border-white': !isMapFullscreen && !gameStore.hasSubmittedGuessForCurrentRound && !(gameStore.isMultiplayer && gameStore.currentRoundResultsMP)
      }">
       <!-- Ensure MapDisplay receives correct props for SP vs MP -->
       <MapDisplay @guess-made="handleMapGuess" ref="mapDisplayRef"
        :round-active="gameStore.isRoundActive"
        :submitted="gameStore.hasSubmittedGuessForCurrentRound || (gameStore.isMultiplayer && !!gameStore.currentRoundResultsMP)"
        :actual-location="gameStore.hasSubmittedGuessForCurrentRound || (gameStore.isMultiplayer && gameStore.currentRoundResultsMP) ? gameStore.getCurrentLocation : null"
        :guess-location="gameStore.isMultiplayer ? null : (gameStore.hasSubmittedGuessForCurrentRound ? gameStore.getCurrentRoundResult?.guess : null)"
        :multiplayer-results="gameStore.isMultiplayer ? gameStore.currentRoundResultsMP : null"
        :current-user-id="gameStore.currentUserId"
        class="w-full h-full cursor-pointer" />

       <!-- Hint Overlay -->
       <div v-if="!isMapFullscreen && !gameStore.hasSubmittedGuessForCurrentRound && !(gameStore.isMultiplayer && gameStore.currentRoundResultsMP)"
         class="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none group-focus-within:opacity-0">
         <span class="bg-black/80 px-2 py-1 rounded">Hover to enlarge</span>
       </div>

       <!-- Result Overlay (Modified for MP) -->
       <div v-if="gameStore.hasSubmittedGuessForCurrentRound || (gameStore.isMultiplayer && gameStore.currentRoundResultsMP)"
         class="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg text-sm max-w-xs shadow-lg">
         <div class="flex items-center mb-3">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
           <h3 class="font-bold text-lg">Round {{ gameStore.currentRound }} Result</h3>
         </div>

         <!-- SP Result Display -->
         <div v-if="!gameStore.isMultiplayer && gameStore.getCurrentRoundResult" class="space-y-3">
            <!-- Distance & Score -->
             <div><p class="text-gray-300 text-xs uppercase tracking-wide font-medium mb-1">Distance</p><p class="font-semibold text-yellow-300 text-2xl">{{ gameStore.getCurrentRoundResult.distanceKm.toFixed(1) }} <span class="text-sm">km</span></p></div>
            <div><p class="text-gray-300 text-xs uppercase tracking-wide font-medium mb-1">Score</p><p class="font-semibold text-green-300 text-2xl">{{ gameStore.getCurrentRoundResult.score }} <span class="text-sm">pts</span></p></div>
         </div>
         <!-- MP Result Display (Shows Your Score for now) -->
          <div v-if="gameStore.isMultiplayer && gameStore.currentRoundResultsMP" class="space-y-1 text-xs">
              <p class="text-base font-semibold mb-2">Scores this round:</p>
               <div v-for="result in gameStore.currentRoundResultsMP" :key="result.userId"
                  :class="['flex justify-between', result.userId === gameStore.currentUserId ? 'text-yellow-300' : 'text-white/80']">
                   <span>{{ gameStore.players[result.userId]?.username || 'Player' }}:</span>
                   <span>{{ result.score }} pts</span>
               </div>
          </div>

         <!-- Total score -->
         <div class="pt-3 mt-3 border-t border-gray-700">
           <p class="text-xs uppercase tracking-wide font-medium text-gray-300 mb-1">Your Total Score</p>
           <p class="font-bold text-2xl text-white">{{ gameStore.totalScore }} <span class="text-sm">pts</span></p>
         </div>
       </div>

       <!-- Next/Finish Buttons (Visible after round end/submission) -->
       <div v-if="gameStore.hasSubmittedGuessForCurrentRound || (gameStore.isMultiplayer && gameStore.currentRoundResultsMP)"
         class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          <!-- Next Round Button -->
         <button v-if="gameStore.currentRound < gameStore.MAX_ROUNDS" @click="nextRoundHandler"
           :disabled="gameStore.isLoading"
           class="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-all flex items-center disabled:opacity-50">
            {{ gameStore.isMultiplayer ? 'Waiting for Next Round...' : 'Next Round' }}
           <svg v-if="!gameStore.isMultiplayer" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
             <svg v-else-if="gameStore.isLoading" class="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         </button>
          <!-- Finish Game Button -->
         <button v-else @click="viewResultsHandler"
           :disabled="gameStore.isLoading"
           class="px-6 py-3 bg-purple-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-purple-700 transition-all flex items-center disabled:opacity-50">
           Finish Game
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
         </button>
       </div>

       <!-- Close Map Button -->
       <button v-if="gameStore.hasSubmittedGuessForCurrentRound || (gameStore.isMultiplayer && gameStore.currentRoundResultsMP)" @click="isMapFullscreen = false"
         class="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
       </button>
     </div>

    <!-- 4. Controls & Info (Bottom Center) -->
     <div
      v-if="(gameStore.gameId || gameStore.isMultiplayer) && !gameStore.isGameOver && !(gameStore.hasSubmittedGuessForCurrentRound && isMapFullscreen) && !(gameStore.isMultiplayer && gameStore.currentRoundResultsMP)"
      class="controls-container absolute bottom-5 left-1/2 -translate-x-1/2 z-20 p-3 md:p-4 bg-black/80 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center space-y-2 border border-gray-700">
      <!-- Guess Coordinates Display -->
       <p v-if="gameStore.currentGuess && !gameStore.hasSubmittedGuessForCurrentRound" class="text-xs text-gray-300">
        Selected: {{ gameStore.currentGuess.lat.toFixed(3) }}°, {{ gameStore.currentGuess.lng.toFixed(3) }}°
      </p>
       <!-- Waiting Message (MP Only) -->
       <p v-if="gameStore.isMultiplayer && gameStore.hasSubmittedGuessForCurrentRound && !gameStore.currentRoundResultsMP" class="text-sm text-yellow-300 animate-pulse">
           Waiting for other players...
       </p>

       <!-- Submit Button -->
       <div class="flex justify-center space-x-3">
        <button @click="submitGuessHandler"
          :disabled="!gameStore.currentGuess || !gameStore.isRoundActive || gameStore.hasSubmittedGuessForCurrentRound"
          class="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-150 ease-in-out font-medium flex items-center">
           <!-- Icons -->
           <svg v-if="!gameStore.currentGuess && !gameStore.hasSubmittedGuessForCurrentRound" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <svg v-else-if="gameStore.hasSubmittedGuessForCurrentRound" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          <!-- Text -->
           {{ gameStore.hasSubmittedGuessForCurrentRound ? "Guess Submitted" : (gameStore.currentGuess ? "Submit Guess" : "Select Location on Map") }}
         </button>
       </div>
     </div>

    <!-- Error Display (Generic for Game Logic/API) -->
    <div v-if="gameStore.gameError && !gameStore.isMultiplayer"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-xl text-center max-w-md">
       <!-- Error content -->
       <button @click="gameStore.clearGameError()" class="mt-4 btn btn-danger">Dismiss</button>
    </div>

    <!-- Loading Overlay (Generic for round transitions etc.) -->
    <div v-if="gameStore.isLoading && !gameStore.isGameOver"
      class="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
       <!-- Loading spinner and text -->
    </div>

    <!-- Start Game Screen (Single Player Only now) -->
    <div v-if="!gameStore.gameId && !gameStore.isMultiplayer && !gameStore.isGameOver"
      class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center z-40">
       <!-- Start game button content -->
        <button @click="startGameHandler" :disabled="!gameStore.isMapsApiReady || gameStore.isLoading"
          class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 rounded-lg shadow-lg hover:from-yellow-400 hover:to-yellow-300 text-xl font-semibold transition-all duration-300 ease-in-out disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center w-full">
            {{ !gameStore.isMapsApiReady ? "Initializing Maps..." : (gameStore.isLoading ? "Starting Game..." : "Start Single Player") }}
        </button>
        <router-link to="/lobby" class="mt-4 text-blue-300 hover:text-white">Or play Multiplayer?</router-link>
    </div>

    <!-- Game Over Screen (Handles both SP and MP) -->
    <div v-if="gameStore.isGameOver && (gameStore.gameId || gameStore.isMultiplayer)"
      class="absolute inset-0 bg-gradient-to-br from-green-800 via-blue-900 to-indigo-900 flex flex-col items-center justify-center text-center p-6 z-40">
       <!-- Game Over content, display final scores, maybe list players for MP -->
        <div class="flex gap-4 justify-center mt-8">
          <button @click="playAgainHandler" class="btn btn-success">
            Play Again {{ gameStore.isMultiplayer ? ' (New Game)' : ''}}
          </button>
          <router-link to="/lobby" v-if="gameStore.isMultiplayer" class="btn btn-secondary">
            Back to Lobby
          </router-link>
          <router-link to="/" v-else class="btn btn-secondary">
            Back Home
          </router-link>
          <button @click="shareResults" class="btn btn-info">
            Share Results
          </button>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StreetViewDisplay from '../components/StreetViewDisplay.vue';
import MapDisplay from '../components/MapDisplay.vue';
import { useGameStore } from '../stores/gameStore';

const props = defineProps({
  gameId: { // Received from router if path is /game/:gameId
    type: String,
    default: null,
  },
});

const gameStore = useGameStore();
const router = useRouter();
const route = useRoute();
const mapDisplayRef = ref(null);
const isMapFullscreen = ref(false); // Local UI state

// --- Handlers ---
function startGameHandler() {
  // Assumes starting a single-player game from this view
  gameStore.startSinglePlayerGame();
}

function handleMapGuess(coordinates) {
  gameStore.recordGuess(coordinates);
}

function submitGuessHandler() {
  gameStore.submitGuess(); // This now handles both SP and MP logic
  // Enlarge map only for SP on submit, MP waits for round_end
  if (!gameStore.isMultiplayer) {
      isMapFullscreen.value = true;
  }
}

function nextRoundHandler() {
  mapDisplayRef.value?.resetMapState();
  isMapFullscreen.value = false;
  gameStore.nextRound(); // This now handles both SP and MP logic
}

function viewResultsHandler() {
    if (!gameStore.isMultiplayer) {
        gameStore.submitFinalResults(); // Submit SP results if not already done
    }
    gameStore.isGameOver = true; // Ensure game over state is set
    console.log("Game finished. Final Score:", gameStore.totalScore);
}

function shareResults() {
  alert("Share feature coming soon!");
}

function playAgainHandler() {
    gameStore.resetGameState(); // Fully reset the store
    if (gameStore.isMultiplayer) {
        router.push('/lobby'); // Go back to lobby for MP
    } else {
        // For SP, can restart immediately or go home
        // startGameHandler(); // Option: Restart SP immediately
        router.push('/'); // Option: Go home
    }
}
function attemptReconnect() {
    console.log("Attempting manual reconnect...");
    gameStore.connectWebSocket(); // Call the store's connect method
}


// --- Lifecycle & Watchers ---
onMounted(() => {
  console.log("GameView mounted. Route params:", route.params);
  gameStore.clearGameError(); // Clear errors on mount

  if (props.gameId) {
    // If gameId is in the URL, assume it's a multiplayer game join attempt
    console.log(`Attempting to join/rejoin multiplayer game: ${props.gameId}`);
    gameStore.setMultiplayerGame(props.gameId);
    // WebSocket connection is triggered by the store watcher on gameId/isMultiplayer change
  } else {
    // No gameId, assume user might want to start a single-player game
    // Or they came here directly - show the "Start Single Player" button
     gameStore.resetGameState(); // Ensure clean state if navigating directly
     gameStore.isMultiplayer = false;
     console.log("GameView loaded without gameId - showing SP start option.");
  }
});

onUnmounted(() => {
  console.log("GameView unmounted.");
  // Optionally disconnect WebSocket when leaving the view,
  // unless you want to allow rejoining the same game easily.
  // For simplicity, let's disconnect fully when leaving the view.
  if (gameStore.isMultiplayer) {
      gameStore.disconnectWebSocket(); // Use store action to disconnect and clear listeners
  }
   // Optionally reset the entire game state when leaving the view
   // gameStore.resetGameState();
});

// Watch for connection status changes to potentially update UI
watch(() => gameStore.wsStatus, (newStatus) => {
  console.log("GameView: WS Status changed to", newStatus);
  // You could show specific UI messages based on status here
});

// Watch for errors to display
watch(() => gameStore.wsError, (newError) => {
    if(newError) {
        console.error("GameView: WS Error:", newError);
        // Error is displayed via conditional rendering above
    }
});

</script>

<style scoped>
/* Re-add map display styles if needed */
.map-container :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}
/* ... other styles ... */
</style>
```

**6. Update Map Display (`src/components/MapDisplay.vue`)**

Modify `MapDisplay` to handle showing results for multiple players.

```vue
<!-- src/components/MapDisplay.vue -->
<template>
    <div ref="mapContainerRef" class="w-full h-full z-0 bg-gray-200"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is imported

const props = defineProps({
    roundActive: { type: Boolean, required: true },
    submitted: { type: Boolean, required: true }, // True if *this* user submitted (SP) or round ended (MP)
    actualLocation: { type: Object, default: null }, // { lat, lng } - Provided ONLY after submission/round end
    guessLocation: { type: Object, default: null }, // { lat, lng } - *This user's* guess, ONLY after submission (SP)
    multiplayerResults: { type: Array, default: null }, // Array of { userId, username, guess: { lat, lng }, score, distance } for MP round end
    currentUserId: { type: [Number, String], default: null },
});

const emit = defineEmits(['guess-made']);

const mapContainerRef = ref(null);
let map = null;
const markers = ref({}); // Store markers by ID (e.g., 'guess_self', 'actual', 'guess_player_123')
const lines = ref({});   // Store lines similarly

// --- Icons --- (Define reusable icons)
const selfGuessIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const otherGuessIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const actualIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});


// --- Map Initialization ---
function initializeMap() {
    // ... (keep existing initializeMap logic using Stadia Maps Tile Layer) ...
     if (!mapContainerRef.value || map) return; // Prevent re-init

    map = L.map(mapContainerRef.value, {
        zoomControl: true, // Keep zoom controls usually
    }).setView([20, 0], 2); // Default view

    // Use Stadia Maps Bright (requires API Key) - Replace with your key or another provider
    // const stadiaApiKey = import.meta.env.VITE_STADIA_API_KEY; // Make sure to set this in your .env
    // L.tileLayer(`https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png?api_key=${stadiaApiKey}`, {
    //     attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //     minZoom: 1,
    //     maxZoom: 18
    // }).addTo(map);

     // Fallback / Alternative: OpenStreetMap tile layer (no API key needed)
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          minZoom: 1,
          maxZoom: 18
     }).addTo(map);


    map.on('click', handleMapClick);
}

// --- Event Handlers ---
function handleMapClick(e) {
    if (props.roundActive && !props.submitted) {
        const coordinates = e.latlng;
        updateMarker('guess_self', coordinates, selfGuessIcon, "Your Guess");
        emit('guess-made', { lat: coordinates.lat, lng: coordinates.lng });
         if (markers.value['guess_self']) {
             markers.value['guess_self'].openPopup();
         }
    }
}

// --- Marker & Line Management ---
function updateMarker(id, coordinates, icon = null, popupText = '') {
    if (!map) return;
    const latLng = L.latLng(coordinates.lat, coordinates.lng);

    if (!markers.value[id]) {
        markers.value[id] = L.marker(latLng, { icon: icon || undefined }).addTo(map);
        if (popupText) {
            markers.value[id].bindPopup(popupText);
        }
    } else {
        markers.value[id].setLatLng(latLng);
        if (icon) markers.value[id].setIcon(icon);
        if (popupText) markers.value[id].setPopupContent(popupText);
    }
    return markers.value[id];
}

function updateLine(id, latLngs, options = { color: 'red', weight: 3 }) {
    if (!map || latLngs.length < 2) return;
    if (!lines.value[id]) {
        lines.value[id] = L.polyline(latLngs, options).addTo(map);
    } else {
        lines.value[id].setLatLngs(latLngs);
        lines.value[id].setStyle(options);
    }
}

function removeMarker(id) {
    if (map && markers.value[id]) {
        map.removeLayer(markers.value[id]);
        delete markers.value[id];
    }
}

function removeLine(id) {
     if (map && lines.value[id]) {
        map.removeLayer(lines.value[id]);
        delete lines.value[id];
    }
}

function clearMapFeatures() {
    console.log("MapDisplay: Clearing markers and lines.");
    if (!map) return;
    // Remove all tracked markers and lines
    Object.keys(markers.value).forEach(removeMarker);
    Object.keys(lines.value).forEach(removeLine);
    markers.value = {};
    lines.value = {};
}

// --- State Management ---
function showSinglePlayerResults() {
    if (!map || !props.actualLocation || !props.guessLocation) return;
     console.log("MapDisplay SP: Showing results", props.guessLocation, props.actualLocation);

     const guessMarkerInstance = updateMarker('guess_self', props.guessLocation, selfGuessIcon, "Your Guess");
     const actualMarkerInstance = updateMarker('actual', props.actualLocation, actualIcon, "Actual Location");
     updateLine('result_self', [props.guessLocation, props.actualLocation], { color: 'blue', weight: 3 });

     // Close popups initially, open actual marker popup
      guessMarkerInstance?.closePopup();
      actualMarkerInstance?.openPopup();

    fitMapToBounds([props.guessLocation, props.actualLocation]);
}

function showMultiplayerResults() {
     if (!map || !props.actualLocation || !props.multiplayerResults) return;
     console.log("MapDisplay MP: Showing results for round", props.multiplayerResults);

    clearMapFeatures(); // Clear previous round features first

     const bounds = [props.actualLocation]; // Start bounds with actual location

      // Add Actual Location Marker
     updateMarker('actual', props.actualLocation, actualIcon, "Actual Location").openPopup();

     // Add markers and lines for each player
     props.multiplayerResults.forEach(result => {
         const playerId = result.userId;
         const isCurrentUser = playerId === props.currentUserId;
         const icon = isCurrentUser ? selfGuessIcon : otherGuessIcon;
         const popup = `<b>${result.username || `Player ${playerId}`}</b><br/>Score: ${result.score}<br/>Distance: ${result.distance?.toFixed(1) ?? '?'} km`;
         const markerId = `guess_player_${playerId}`;
         const lineId = `result_line_${playerId}`;

         if(result.guess) { // Only show if guess exists
            updateMarker(markerId, result.guess, icon, popup);
            updateLine(lineId, [result.guess, props.actualLocation], { color: isCurrentUser ? 'blue' : '#666', weight: 2, opacity: 0.7 });
            bounds.push(result.guess);
         } else {
             console.warn(`No guess data for player ${playerId}`);
         }
     });

    fitMapToBounds(bounds);
}

function fitMapToBounds(locations) {
    if (!map || locations.length === 0) return;
    const latLngs = locations.map(loc => L.latLng(loc.lat, loc.lng));
    const bounds = L.latLngBounds(latLngs);
     if (bounds.isValid()) {
         map.flyToBounds(bounds, { padding: [70, 70], duration: 1, easeLinearity: 0.5 });
     } else if (latLngs.length === 1) {
         // If only one point (e.g., only actual location if no one guessed), fly to it
         map.flyTo(latLngs[0], Math.max(map.getZoom(), 5), {duration: 1}); // Zoom to at least level 5
     }
     // Force resize after animation
     setTimeout(() => map?.invalidateSize(), 1100);
}

function resetMapState() {
    clearMapFeatures();
    if (map) map.flyTo([20, 0], 2); // Reset view gently
}

// Expose reset function
defineExpose({ resetMapState });

// --- Lifecycle & Watchers ---
onMounted(() => {
    setTimeout(() => {
        initializeMap();
         // Check initial state on mount (e.g., if page reloads mid-round end)
         if (props.submitted || props.multiplayerResults) {
             if (props.multiplayerResults) {
                 showMultiplayerResults();
             } else if (props.guessLocation && props.actualLocation) {
                 showSinglePlayerResults();
             }
         }
    }, 50);
});

onBeforeUnmount(() => {
    if (map) {
        map.remove();
        map = null;
    }
});

// Watch for round end / submission state change
watch(() => [props.submitted, props.multiplayerResults], ([newSubmitted, newMpResults], [oldSubmitted, oldMpResults]) => {
    // Trigger results display only when state newly becomes "submitted" or MP results arrive
    const justSubmitted = newSubmitted && !oldSubmitted;
    const resultsJustArrived = newMpResults && !oldMpResults;

    if (justSubmitted || resultsJustArrived) {
         if (newMpResults) {
             showMultiplayerResults();
         } else if (props.guessLocation && props.actualLocation) {
             // Ensure SP guess/actual locations are present before showing
             showSinglePlayerResults();
         }
    }
}, { deep: true }); // Deep watch needed for multiplayerResults array


// Watch for round starting (active becomes true, submitted becomes false)
watch(() => [props.roundActive, props.submitted], ([newActive, newSubmitted], [oldActive, oldSubmitted]) => {
    if (newActive && !newSubmitted && (!oldActive || oldSubmitted)) {
        // New round started or state reset
        resetMapState();
    }
});


</script>

<style>
/* Leaflet CSS already imported */
.leaflet-container { /* Ensure map fills container */
    height: 100%;
    width: 100%;
    background-color: #e5e7eb; /* Tailwind gray-200 */
}
</style>
```

**7. Add Navigation Link (`src/App.vue`)**

Add a link to the Multiplayer Lobby in the main navigation.

```vue
// src/App.vue
// ... existing template ...
        <div class="flex items-center">
          <router-link to="/"
            class="mx-3 text-sm lg:text-base hover:text-yellow-300 transition-colors font-medium">Home</router-link>
          <router-link to="/game" v-if="!authStore.isAuthenticated" <!-- Show only if logged out? -->
            class="mx-3 text-sm lg:text-base hover:text-yellow-300 transition-colors font-medium">New Game (SP)</router-link>
           <router-link to="/lobby" v-if="authStore.isAuthenticated" <!-- Show only if logged in -->
             class="mx-3 text-sm lg:text-base hover:text-yellow-300 transition-colors font-medium">Multiplayer</router-link>
          <!-- Leaderboard Link -->

          <!-- Conditional Auth Links -->
          <!-- ... rest of the nav ... -->
        </div>
// ... rest of the component ...
```

---

**Summary of Key Changes & Next Steps:**

1.  **Backend:**
    *   Enhanced WebSocket Hub to manage game rooms (`internal/websocket/`).
    *   Defined WebSocket message structures.
    *   Modified `/game/ws` endpoint for authenticated connection to specific rooms.
    *   Added `/game/create` endpoint for initiating multiplayer games.
    *   Updated DB models (`Game`, added `UserRoundGuess`).
    *   **TODO (Backend):** Implement detailed game logic within the Hub (`HandleGuess`, `EndRound`, `StartNextRound`, `EndGame`), including state management (`MultiplayerGameState`), fetching usernames, calculating scores, and interacting with the DB for persistence.
2.  **Frontend:**
    *   Created `MultiplayerLobby.vue` view.
    *   Added routing for the lobby and modified the game route.
    *   Created `websocketService.js` for managing the connection.
    *   Significantly updated `GameStore.js` to handle multiplayer state, integrate WebSocket service, and differentiate between SP/MP logic.
    *   Updated `GameView.vue` to handle joining MP games via URL param, connect WebSocket, display MP UI elements (player list), and react to WebSocket events.
    *   Updated `MapDisplay.vue` to show results for multiple players.
    *   Added navigation link to the lobby.
    *   **TODO (Frontend):** Refine the UI for displaying multiplayer information (player guesses on map, round end summaries, waiting states), improve error handling, add visual cues for connection status.

This provides the foundational structure for multiplayer. The most significant remaining work is implementing the detailed game turn logic and state synchronization on the backend within the WebSocket Hub and refining the UI on the frontend to clearly display the multiplayer aspects. Remember to replace placeholder API keys and potentially adjust WebSocket URLs for production.