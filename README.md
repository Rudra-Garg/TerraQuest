
# TerraQuest 🌍

A modern, interactive geography guessing game built with Vue 3 and Google Street View. Test your geography knowledge by exploring locations worldwide and pinpointing them on a map.

## 🌟 Features

- **Interactive Street View Experience**: Explore real-world locations using Google Street View
- **Real-time Map Interaction**: Place your guesses on an interactive map
- **Score System**: Earn points based on the accuracy of your guesses
- **User Authentication**: Create an account to track your progress and compete with others
- **Leaderboard System**: Compare your skills with other players worldwide
- **Responsive Design**: Seamless experience across all devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rudra-Garg/TerraQuest.git
cd TerraQuest
 ```


2. Install dependencies:
```bash
npm install
 ```

3. Create a .env file in the root directory with your Google Maps API key:
```plaintext
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_BACKEND_URL=your_backend_url_here
 ```


4. Start the development server:
```bash
npm run dev
 ```

## 🛠️ Built With
- Vue 3 - Progressive JavaScript Framework
- Vite - Next Generation Frontend Tooling
- Pinia - State Management
- Tailwind CSS - Utility-first CSS Framework
- Leaflet - Interactive Maps
- Google Maps API - Street View Integration
## 🎮 How to Play
1. Start a Game : Click "Play Now" to begin a new game session
2. Explore : Use Street View to look around your random location
3. Make Your Guess : Click on the map to place your guess
4. Submit : Confirm your guess to see how close you were
5. Continue : Play through multiple rounds to maximize your score
## 🔧 Project Structure
```plaintext
src/
├── components/     # Reusable Vue components
├── views/          # Page components
├── stores/         # Pinia state management
├── services/       # API services
├── router/         # Vue Router configuration
└── assets/         # Static assets
 ```



## 🙏 Acknowledgments
- Google Maps Platform for Street View API
- OpenStreetMap contributors
- The Vue.js team and community