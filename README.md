# Neko-Noir 🐈‍⬛🎴

Neko-Noir is an online single-player card game built with React and Vite, where players draw random cards from a deck of 5 cards with the aim of winning the game by drawing all cards without hitting the exploding kitten card. The game includes a leaderboard to record players’ wins using Redis as a database and a Golang backend.

Demo: [Neko Noir](https://nekonoir.netlify.app)

## Table of Contents
- [Game Overview](#game-overview)
  - [Card Types](#card-types)
  - [Rules of the Game](#rules-of-the-game)
  - [Bonus Features](#bonus-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Game Mechanics](#game-mechanics)
  - [Starting the Game](#starting-the-game)
  - [Gameplay](#gameplay)
  - [Winning Condition](#winning-condition)
  - [Leaderboard](#leaderboard)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Game Overview

Neko-Noir is a card game where each game session consists of a randomized deck of 5 cards, and players draw cards to reveal them one by one. The goal is to draw all 5 cards without drawing the **Exploding Kitten** card. The game also features a **Leaderboard** that tracks users' wins. 

### Card Types

The deck has the following card types:
1. **Cat Card** 😼 - Safe card, removed from the deck when drawn.
2. **Defuse Card** 🙅‍♂️ - Safe card, can be used to defuse one bomb drawn later. Removed from the deck when drawn.
3. **Shuffle Card** 🔀 - Resets the game and reorders the deck.
4. **Exploding Kitten Card** 💣 - Drawing this card results in a loss.

### Rules of the Game

1. When the game starts, a deck of 5 cards is created with a random order.
2. Players can draw cards from the deck one by one:
   - **Cat Card** 😼: Removed from the deck.
   - **Exploding Kitten Card** 💣: Ends the game, and the player loses.
   - **Defuse Card** 🙅‍♂️: Removed from the deck; can defuse one **Exploding Kitten** card drawn later.
   - **Shuffle Card** 🔀: Resets the game, and the deck is refilled with 5 new cards.
3. The player **wins** if they successfully draw all 5 cards without drawing an **Exploding Kitten**.

### Bonus Features

- **Game Save**: The game state is saved at every stage, allowing players to continue from where they left off.
- **Real-Time Leaderboard**: The leaderboard updates in real-time across all players currently in the game.

## Tech Stack

- **Frontend**: React with Vite and Redux for state management.
- **Backend**: Golang, to manage API requests and interaction with the database.
- **Database**: Redis, to store user points and leaderboard data.

---

## Getting Started

Follow these steps to set up the project.

### Prerequisites

- **Node.js** and **npm** (for running the React app)
- **Go** (for the backend server)
- **Redis** (can be hosted on Upstash or locally using Docker)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/neko-noir.git
   cd neko-noir

2. **Front End Setup**

   ```bash
   cd neko-frontend
   npm install
   vite
  
  - go to http://localhost:5173

3. **Backend Setup**

   ```bash
   cd neko-backend

 - install dependencies
   ```bash
   go mod tidy
 - run the backend server
    ```bash
    go run main.go

- backend server should be running (you need to set up REDIS_URL as environment variable)
4. **Custom Redis**
To have custom redis, change the REDIS_URL to the redis running port address.
- to change the REDIS_URL,
  ```bash
  set REDIS_URL="rediss://your_redis_url"

## Game Mechanics

### Starting the Game
1. Enter your username on the game’s main screen to start.
2. Click the **Play** button to initialize a new game session with a shuffled deck of 5 cards.

### Gameplay
- Draw a card from the deck by clicking on the deck.
- The game reacts according to the type of card drawn:
  - **Cat Card** 😼: Safe. The card is removed from the deck.
  - **Exploding Kitten Card** 💣: Game over. You lose. (given defuse cards are 0)
  - **Defuse Card** 🙅‍♂️: Safe and can defuse one **Exploding Kitten** card. **Exploding Kitten** card is removed from the deck.
  - **Shuffle Card** 🔀: The game restarts with a reshuffled deck of 5 cards.

### Winning Condition
- Draw all 5 cards without hitting an **Exploding Kitten Card** 💣 to win.
- Each win awards one point to the player.

### Leaderboard
- The leaderboard displays all players and their winning streaks.
- Points are stored in Redis, and one win equals one point.
- The leaderboard updates in real-time (almost) for all players.

## Future Improvements

- Add sound effects and animations for a more engaging experience.
- Implement multiplayer mode where multiple players can play against each other.
- Introduce achievements and badges based on player performance.
- Improve animation handling with a more efficient system. Currently, the game uses videos for animations; transitioning to a more responsive animation system would enhance performance and visual appeal.
- Optimize the core game loop for smoother gameplay and better resource management, ensuring that the game remains responsive and efficient even with additional features.


# License
This project is licensed under the MIT License.

