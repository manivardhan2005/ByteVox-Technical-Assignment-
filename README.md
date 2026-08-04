# ByteVox Simplified Exchange

A high-performance, real-time simplified exchange simulation built with React, Node.js, Express, and Socket.IO.

## Features
- **Real-Time Order Book**: Automatic matching engine that matches compatible buy and sell orders.
- **Limit & Market Orders**: Support for both fixed price (limit) and market-price execution.
- **Real-Time Updates**: WebSocket integration pushes order book, trades, and system stats to clients instantly.
- **Premium UI**: Glassmorphism, micro-animations, and dynamic depth charts built without external UI frameworks.

## Prerequisites
- Docker and Docker Compose
OR
- Node.js (v18+)

## Setup Instructions

### Using Docker (Recommended)
1. Clone the repository and navigate to the root directory.
2. Run the following command to start both the frontend and backend:
   ```bash
   docker-compose up --build
   ```
3. Open your browser and navigate to `http://localhost`

### Manual Setup
**Backend:**
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
(The backend will run on port 3001)

**Frontend:**
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the provided local URL (usually `http://localhost:5173`) in your browser.

## Tech Stack
- **Frontend**: Vite, React, TypeScript, Recharts, Vanilla CSS.
- **Backend**: Node.js, Express, Socket.IO, TypeScript.
