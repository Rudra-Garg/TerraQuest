# TerraQuest Frontend

A modern geography guessing game built with Vue 3, Tailwind CSS, and WebSocket support for real-time multiplayer gameplay.

## Features

- 🌍 Single-player geography guessing game
- 👥 Real-time multiplayer support
- 🗺️ Interactive map with guess placement
- 🌐 Google Street View integration
- 📊 Score tracking and round management
- 🔒 User authentication and account management
- 🎮 Real-time game state synchronization
- 📱 Responsive design for all devices

## Prerequisites

- Node.js (v20 or later)
- npm or yarn
- A valid Google Maps API key
- Backend server running (see backend repository)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd geoguessr
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_BACKEND_URL=http://localhost:8080
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/`
  - `assets/` - Static assets
  - `components/` - Vue components
  - `router/` - Vue Router configuration
  - `services/` - API and WebSocket services
  - `stores/` - Pinia stores for state management
  - `views/` - Page components
  - `App.vue` - Root component
  - `main.js` - Application entry point
  - `style.css` - Global styles

## Key Components

- `GameView.vue` - Main game interface
- `StreetViewDisplay.vue` - Google Street View integration
- `MapDisplay.vue` - Interactive map for guess placement
- `MultiplayerLobby.vue` - Multiplayer game creation/joining

## State Management

The application uses Pinia for state management with these main stores:
- `GameStore` - Game state and logic
- `AuthStore` - User authentication state

## WebSocket Integration

Real-time multiplayer features are implemented using WebSocket:
- Player synchronization
- Live game state updates
- Real-time guess submission and scoring

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_GOOGLE_MAPS_API_KEY | Google Maps API key for Street View |
| VITE_BACKEND_URL | URL of the backend API server |

## License

[License Type] - See LICENSE file for details