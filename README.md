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

## File Structure

```
/src
  App.tsx                 // Main application (211 lines)
  index.tsx              // Entry point (17 lines)
  types.ts               // Type definitions (54 lines)
  /components
    Satellites.tsx       // Satellite management (157 lines)
    RiskPanel.tsx        // Risk alerts display (146 lines)
    MiniGlobe.tsx        // Three.js globe (122 lines)
    KpChart.tsx          // D3 line chart (136 lines)
  /logic
    data.ts              // Data fetching (57 lines)
    risk.ts              // Risk computation (81 lines)
/data
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