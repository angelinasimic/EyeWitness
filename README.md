# EyeWitness - Satellite Risk Monitoring

A satellite monitoring system for tracking satellite conjunctions and space weather risks.

## Features

- **Satellite Management**: Add satellites from predefined list or manual entry
- **Risk Assessment**: Monitor conjunction events and space weather alerts  
- **3D Visualization**: Basic Three.js globe showing satellite positions
- **Space Weather Chart**: D3.js line chart displaying Kp index data

## Data Sources

- **Space Weather**: NOAA SWPC Kp index feed with local fallback
- **Conjunctions**: Local sample data mirroring CelesTrak SOCRATES format
- **Satellites**: 15 pre-seeded real satellite options

## Tech Stack

- React + TypeScript
- Three.js (minimal globe)
- D3.js (line chart)
- No other dependencies

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## File Structure

```
/src
  App.tsx                 // Main application
  index.tsx              // Entry point
  types.ts               // Type definitions
  /components
    Satellites.tsx       // Satellite management
    RiskPanel.tsx        // Risk alerts display
    MiniGlobe.tsx        // Three.js globe
    KpChart.tsx          // D3 line chart
  /logic
    data.ts              // Data fetching
    risk.ts              // Risk computation
/public
  satellite-options.json // 15 real satellites
  sample-conjunctions.json // Conjunction events
  sample-spaceweather.json // Kp index data
```

## Key Features

- Real-time space weather monitoring
- Satellite conjunction risk assessment
- 3D visualization of satellite positions
- Interactive risk alert management
- NOAA SWPC data integration

## Usage

1. **Add Satellites**: Go to the "Satellites" tab and add satellites from the dropdown or manually
2. **View Risks**: Check the "Risk Alerts" tab for conjunction and space weather alerts
3. **Visualize**: Use the "Visualization" tab to see the 3D globe and Kp chart
4. **Execute Actions**: Click "Execute Action" on alerts to mark them as handled

## Data Sources

- **Space Weather**: Fetches live Kp index from NOAA SWPC, falls back to sample data
- **Conjunctions**: Uses local sample data with realistic satellite names
- **Satellites**: 15 pre-configured real satellite options available