package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/rs/cors"
)

var ctx = context.Background()
var redisClient *redis.Client

func main() {
	// Parse Redis URL
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL environment variable not set")
	}

	// Parse the Redis URL using the environment variable
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	// Initialize the Redis client
	redisClient = redis.NewClient(opt)

	// Test the connection
	if _, err := redisClient.Ping(ctx).Result(); err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Connected to Redis")

	// Set up HTTP handlers
	http.HandleFunc("/api/users", getUsersHandler)
	http.HandleFunc("/api/user", userHandler)
	http.HandleFunc("/api/updateUser", updateUserHandler)
	http.HandleFunc("/api/getUserIDByUsername", getUserIDByUsernameHandler)

	// Set up CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Allow all origins
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Wrap the default HTTP handler with the CORS middleware
	handler := c.Handler(http.DefaultServeMux)

	// Start HTTP server
	log.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

type User struct {
	DefuseCount int    `json:"defuseCount"`
	HighScore   int    `json:"highScore"`
	ID          string `json:"id"`
	Username    string `json:"username"`
}

func generateUniqueID() string {
	id, err := uuid.NewRandom()
	if err != nil {
		log.Fatalf("Failed to generate UUID: %v", err)
	}
	return id.String()
}
func findOrCreateUser(ctx context.Context, username string) (*User, error) {
	// Check if user ID exists for the given username
	userIDKey := fmt.Sprintf("username:%s", username) // This key maps username to userID
	userID, err := redisClient.Get(ctx, userIDKey).Result()

	if err == redis.Nil {
		// User does not exist, create a new one
		newUser := &User{
			DefuseCount: 0,
			HighScore:   0,
			ID:          generateUniqueID(),
			Username:    username,
		}

		userKey := fmt.Sprintf("user:%s", newUser.ID) // Key to store user data

		// Serialize and store new user data in Redis
		userData, err := json.Marshal(newUser)
		if err != nil {
			return nil, fmt.Errorf("error marshaling new user: %v", err)
		}

		err = redisClient.Set(ctx, userKey, userData, 0).Err() // Save user data
		if err != nil {
			return nil, fmt.Errorf("error saving new user to Redis: %v", err)
		}

		// Track the user ID in the userIDs set
		err = redisClient.SAdd(ctx, "userIDs", newUser.ID).Err()
		if err != nil {
			return nil, fmt.Errorf("error adding user ID to set: %v", err)
		}

		// Map the username to the user ID
		err = redisClient.Set(ctx, userIDKey, newUser.ID, 0).Err()
		if err != nil {
			return nil, fmt.Errorf("error saving username to user ID mapping: %v", err)
		}

		return newUser, nil
	} else if err != nil {
		return nil, fmt.Errorf("error querying Redis for username: %v", err)
	}

	// If the user already exists, fetch their details by user ID
	userKey := fmt.Sprintf("user:%s", userID)
	userData, err := redisClient.Get(ctx, userKey).Result()
	if err != nil {
		return nil, fmt.Errorf("error retrieving user data: %v", err)
	}

	var user User
	err = json.Unmarshal([]byte(userData), &user)
	if err != nil {
		return nil, fmt.Errorf("error decoding user data: %v", err)
	}

	return &user, nil
}

func updateUser(ctx context.Context, userID string, updatedData map[string]interface{}) (*User, error) {
	userKey := fmt.Sprintf("user:%s", userID)

	// Fetch existing user data
	userData, err := redisClient.Get(ctx, userKey).Result()
	if err == redis.Nil {
		return nil, fmt.Errorf("user with ID %s not found", userID)
	} else if err != nil {
		return nil, fmt.Errorf("error retrieving user: %v", err)
	}

	// Unmarshal existing data to User struct
	var user User
	err = json.Unmarshal([]byte(userData), &user)
	if err != nil {
		return nil, fmt.Errorf("error decoding user data: %v", err)
	}

	// Apply updates from updatedData
	if val, ok := updatedData["defuseCount"].(float64); ok {
		user.DefuseCount = int(val)
	}
	if val, ok := updatedData["highScore"].(float64); ok {
		user.HighScore = int(val)
	}

	// Marshal and save the updated user data to Redis
	updatedUserData, err := json.Marshal(user)
	if err != nil {
		return nil, fmt.Errorf("error encoding updated user data: %v", err)
	}

	err = redisClient.Set(ctx, userKey, updatedUserData, 0).Err()
	if err != nil {
		return nil, fmt.Errorf("error saving updated user to Redis: %v", err)
	}

	return &user, nil
}
func userHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Missing 'username' query parameter", http.StatusBadRequest)
		return
	}

	user, err := findOrCreateUser(ctx, username)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error processing user: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
func updateUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("id")
	if userID == "" {
		http.Error(w, "Missing 'id' query parameter", http.StatusBadRequest)
		return
	}

	var updatedData map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&updatedData)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updatedUser, err := updateUser(ctx, userID, updatedData)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating user: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedUser)
}
func getUsersHandler(w http.ResponseWriter, r *http.Request) {
	// Fetch all user IDs from the Redis set
	userIDs, err := redisClient.SMembers(ctx, "userIDs").Result()
	if err != nil {
		http.Error(w, "Failed to retrieve user IDs", http.StatusInternalServerError)
		return
	}

	var users []User

	// Iterate over each user ID and get the user data
	for _, userID := range userIDs {
		userKey := fmt.Sprintf("user:%s", userID) // Use user:<userID> pattern
		userData, err := redisClient.Get(ctx, userKey).Result()
		if err == redis.Nil {
			continue // Skip if user data is missing
		} else if err != nil {
			http.Error(w, fmt.Sprintf("Error retrieving user %s data: %v", userID, err), http.StatusInternalServerError)
			return
		}

		var user User
		err = json.Unmarshal([]byte(userData), &user)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error decoding user %s data: %v", userID, err), http.StatusInternalServerError)
			return
		}

		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
func getUserIDByUsernameHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Missing 'username' query parameter", http.StatusBadRequest)
		return
	}

	// Look up user ID by username
	userIDKey := fmt.Sprintf("username:%s", username)
	userID, err := redisClient.Get(ctx, userIDKey).Result()

	if err == redis.Nil {
		// If user not found, create a new user
		newUser, err := findOrCreateUser(ctx, username)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error creating user: %v", err), http.StatusInternalServerError)
			return
		}

		// Set userID to the newly created user's ID
		userID = newUser.ID
	} else if err != nil {
		http.Error(w, fmt.Sprintf("Error retrieving user ID: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"userID": userID})
}
