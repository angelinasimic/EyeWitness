# EyeWitness Application

A comprehensive space situational awareness application that provides real-time monitoring of space weather, satellite tracking, and AI-powered decision support for space operations.

## Features

- **Real-time Space Weather Monitoring**: SWPC alerts, Kp index, CME tracking
- **Satellite Tracking**: 3D visualization with SGP4 propagation
- **Conjunction Analysis**: Space-Track integration for collision avoidance
- **AI Decision Engine**: Automated recommendations for space operations
- **WebSocket Integration**: Real-time updates and alerts
- **Modern Tech Stack**: React, TypeScript, Fastify, Three.js

## Architecture

```
├── apps/
│   ├── api/          # Fastify API server
│   └── web/          # React frontend
├── packages/
│   ├── core/         # Shared types and schemas
│   └── sgp4/         # Satellite propagation library
└── docker-compose.yml
```

## Tech Stack

### Backend (API)
- **Fastify** - High-performance web framework
- **TypeScript** - Type-safe development
- **WebSocket** - Real-time communication
- **Node-cron** - Scheduled data polling
- **Axios** - HTTP client for external APIs

### Frontend (Web)
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Three.js** - 3D visualization
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling

### External APIs
- **SWPC** - Space Weather Prediction Center
- **Space-Track** - Satellite conjunction data
- **NASA DONKI** - Space weather notifications
- **CelesTrak** - Satellite orbital data

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start the application**
   ```bash
   # Start both API and web app
   npm run dev
   
   # Or start individually
   npm run dev:api    # API server on :3000
   npm run dev:web    # Web app on :5173
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# API Configuration
NASA_API_KEY=your_nasa_api_key_here
SPACETRACK_USER=your_space_track_username
SPACETRACK_PASS=your_space_track_password
JWT_SECRET=your_jwt_secret_here

# Service URLs
CELESTRAK_BASE=https://celestrak.org
SWPC_BASE=https://services.swpc.noaa.gov

# Application Settings
DEMO=false
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
```

## API Endpoints

### Health & Status
- `GET /healthz` - Basic health check
- `GET /healthz/detailed` - Detailed service status
- `GET /metrics` - System metrics

### Space Weather
- `GET /space-weather` - Combined space weather data
- `GET /space-weather/kp` - Kp index data
- `GET /space-weather/alerts` - SWPC alerts

### Satellites
- `GET /satellites` - List all satellites
- `POST /satellites` - Add new satellite
- `PUT /satellites/:id` - Update satellite
- `DELETE /satellites/:id` - Remove satellite

### Alerts & Decisions
- `GET /alerts` - List all alerts
- `POST /alerts/:id/acknowledge` - Acknowledge alert
- `GET /decisions` - List all decisions
- `POST /decisions/suggest` - Generate decision suggestions

## Usage

### Adding Satellites
1. Navigate to the Satellites page
2. Click "Add Satellite" or "Add Demo Satellites"
3. Enter satellite data (TLE, NORAD ID, etc.)
4. View 3D visualization in Situational Picture

### Monitoring Space Weather
1. Check the Alerts page for active space weather events
2. View real-time Kp index and geomagnetic activity
3. Monitor CME arrivals and solar wind conditions

### AI Decision Support
1. When alerts are generated, the AI engine analyzes the situation
2. View suggested actions in the Decisions page
3. Execute recommended maneuvers or safe mode operations

## 🔧 Development

### Project Structure
```
apps/
├── api/                 # Backend API server
│   ├── src/
│   │   ├── adapters/    # External API clients
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utility functions
│   └── package.json
├── web/                 # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── utils/       # Utility functions
│   └── package.json
packages/
├── core/                # Shared types and schemas
└── sgp4/                # Satellite propagation
```

### Available Scripts

```bash
# Development
npm run dev              # Start both API and web
npm run dev:api          # Start API server only
npm run dev:web          # Start web app only

# Building
npm run build            # Build all packages
npm run build --workspace=apps/api    # Build API only
npm run build --workspace=apps/web    # Build web only

# Testing
npm run test             # Run all tests
npm run test --workspace=apps/api     # Test API
npm run test --workspace=apps/web     # Test web

# Linting
npm run lint             # Lint all packages
npm run type-check       # TypeScript type checking
```

## Docker Support

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run individual services
docker-compose up api    # API server only
docker-compose up web    # Web app only
```

## Data Sources

- **SWPC**: Space weather alerts and Kp index
- **Space-Track**: Satellite conjunction data
- **NASA DONKI**: Space weather notifications
- **CelesTrak**: Satellite orbital elements

## 🤖 AI Decision Engine

The AI decision engine analyzes space weather and conjunction data to provide automated recommendations:

- **Space Weather Analysis**: Kp index thresholds, CME timing
- **Conjunction Analysis**: Miss distance calculations, maneuver planning
- **Risk Assessment**: Probability calculations, time windows
- **Action Recommendations**: Safe mode, maneuvers, monitoring

## Security

- Rate limiting on API endpoints
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- Environment variable validation
- Input validation with Zod schemas

## Performance

- WebSocket for real-time updates
- Efficient polling with configurable intervals
- 3D rendering optimization with Three.js
- Caching with TanStack Query
- TypeScript for compile-time error checking

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set production environment variables
2. Configure reverse proxy (nginx)
3. Set up SSL certificates
4. Configure monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Space Weather Prediction Center (SWPC)
- Space-Track.org for conjunction data
- NASA DONKI for space weather notifications
- CelesTrak for satellite data
- The open-source community for excellent tools and libraries
