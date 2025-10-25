import { SpaceWeatherData, ConjunctionEvent, SatelliteOption } from '../types';

// Simple fetch wrapper with error handling
async function fetchJSON<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

// Fetch space weather data (uses sample data)
export async function fetchSpaceWeather(): Promise<SpaceWeatherData[]> {
  return await fetchJSON<SpaceWeatherData[]>('/sample-spaceweather.json');
}

// Load conjunction events from sample data
export async function loadConjunctions(): Promise<ConjunctionEvent[]> {
  return await fetchJSON<ConjunctionEvent[]>('/sample-conjunctions.json');
}

// Load satellite options for dropdown
export async function loadSatelliteOptions(): Promise<SatelliteOption[]> {
  return await fetchJSON<SatelliteOption[]>('/satellite-options.json');
}