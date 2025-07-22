package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sort"
	"sync"
)

// message format
type Message struct {
	SenderID   string `json:"senderID"`
	ReceiverID string `json:"receiverID"`
	Body       string `json:"body"`
}

// Connection with ws
type Connection struct {
	ws   *websocket.Conn
	send chan Message
	room *Room
	id   string //uniqueID
}

// chat room
type Room struct {
	id          string
	connections map[*Connection]bool
	broadcast   chan Message
	mx          sync.Mutex
	done        chan bool
}

// central hub for managing chat rooms
type Hub struct {
	rooms map[string]*Room
	mx    sync.Mutex
}

var chatHub = Hub{
	rooms: make(map[string]*Room),
}

func (h *Hub) getRoom(roomID string) *Room {
	h.mx.Lock()
	defer h.mx.Unlock()

	if r, ok := h.rooms[roomID]; ok {
		return r
	}
	r := &Room{
		id:          roomID,
		connections: make(map[*Connection]bool),
		broadcast:   make(chan Message),
		done:        make(chan bool),
	}
	h.rooms[roomID] = r
	go r.run()
	return r
}

// room goroutine which broadcasts messages
func (r *Room) run() {
	for {
		select {
		case msg := <-r.broadcast:
			r.mx.Lock()
			log.Printf("Broadcasting message in room %s: %+v", r.id, msg)
			for c := range r.connections {
				select {
				case c.send <- msg:
				default:
					close(c.send)
					delete(r.connections, c)
				}
			}
			r.mx.Unlock()
		case <-r.done:
			return
		}
	}
}

func generateRoomID(a, b string) string {
	ids := []string{a, b}
	sort.Strings(ids)
	return fmt.Sprintf("%s:%s", ids[0], ids[1])
}

// ws endpoint
func ChatSocket(c *gin.Context) {
	userA := c.Query("userID")     //connected side uniqueID
	userB := c.Query("chatWithID") //target uniqueID

	log.Printf("WebSocket connection attempt: userA=%s, userB=%s", userA, userB)

	if userA == "" || userB == "" {
		log.Printf("Missing user IDs: userA=%s, userB=%s", userA, userB)
		c.JSON(http.StatusBadRequest, gin.H{"error": "2 user IDs are required"})
		return
	}

	roomID := generateRoomID(userA, userB)
	log.Printf("Generated room ID: %s", roomID)

	room := chatHub.getRoom(roomID)

	// CORS and WebSocket upgrader cfg
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create connection"})
		return
	}

	log.Printf("WebSocket connection established for user %s in room %s", userA, roomID)

	conn := &Connection{
		ws:   ws,
		send: make(chan Message, 256),
		room: room,
		id:   userA,
	}

	room.mx.Lock()
	room.connections[conn] = true
	connectionCount := len(room.connections)
	room.mx.Unlock()

	log.Printf("User %s joined room %s. Total connections: %d", userA, roomID, connectionCount)

	go conn.readPump()
	go conn.writePump()
}

// reading loop
func (c *Connection) readPump() {
	defer func() {
		log.Printf("Closing read pump for user %s", c.id)
		c.room.mx.Lock()
		delete(c.room.connections, c)
		connectionCount := len(c.room.connections)
		c.room.mx.Unlock()

		log.Printf("User %s left room %s. Remaining connections: %d", c.id, c.room.id, connectionCount)

		close(c.send)
		c.ws.Close()
	}()

	c.ws.SetReadLimit(512)
	c.ws.SetPongHandler(func(string) error {
		log.Printf("Received pong from user %s", c.id)
		return nil
	})

	for {
		messageType, data, err := c.ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket unexpected error for user %s: %v", c.id, err)
			} else {
				log.Printf("WebSocket closed normally for user %s: %v", c.id, err)
			}
			break
		}

		log.Printf("Received message type %d from user %s: %s", messageType, c.id, string(data))

		if messageType != websocket.TextMessage {
			log.Printf("Ignoring non-text message type %d from user %s", messageType, c.id)
			continue
		}

		var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			log.Printf("Failed to unmarshal message from user %s: %v. Raw data: %s", c.id, err, string(data))
			c.sendErrorMessage("Invalid message format")
			continue
		}

		log.Printf("Parsed message from %s: %+v", c.id, msg)

		// Automātiski izlabo senderID, ja tas ir tukšs vai nepareizs
		if msg.SenderID == "" || msg.SenderID != c.id {
			log.Printf("Auto-correcting senderID from '%s' to '%s'", msg.SenderID, c.id)
			msg.SenderID = c.id
		}

		// Pārbaudi vai receiverID ir norādīts
		if msg.ReceiverID == "" {
			log.Printf("Missing receiverID in message from %s", c.id)
			c.sendErrorMessage("ReceiverID is required")
			continue
		}

		// Pārbaudi vai ziņojuma saturs nav tukšs
		if msg.Body == "" {
			log.Printf("Empty message body from user %s", c.id)
			c.sendErrorMessage("Message body cannot be empty")
			continue
		}

		select {
		case c.room.broadcast <- msg:
			log.Printf("Message from %s successfully sent to broadcast", c.id)
		default:
			log.Printf("Room broadcast channel is full, dropping message from %s", c.id)
		}
	}
}

func (c *Connection) sendErrorMessage(errorText string) {
	errorMsg := Message{
		SenderID:   "system",
		ReceiverID: c.id,
		Body:       errorText,
	}
	select {
	case c.send <- errorMsg:
	default:
		log.Printf("Failed to send error message to user %s", c.id)
	}
}

// writing loop
func (c *Connection) writePump() {
	defer func() {
		log.Printf("Closing write pump for user %s", c.id)
		c.ws.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			if !ok {

				c.ws.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			log.Printf("Sending message to user %s: %+v", c.id, msg)

			if err := c.ws.WriteJSON(msg); err != nil {
				log.Printf("Error writing message to user %s: %v", c.id, err)
				return
			}
		}
	}
}
