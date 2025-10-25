import { SpaceWeatherData, ConjunctionEvent, SatelliteOption } from '../types';

/**
 * Simple fetch wrapper with error handling
 * 
 * @param url - The URL to fetch data from
 * @returns Promise that resolves to the parsed JSON data
 */
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

/**
 * Fetch space weather data from NOAA SWPC
 * 
 * Tries primary NOAA feed, then alternative feed, then local sample.
 * Kp index measures geomagnetic activity (0-9 scale, 6+ = alert level).
 * 
 * @returns Promise that resolves to an array of space weather data points
 */
export async function fetchSpaceWeather(): Promise<SpaceWeatherData[]> {
  try {
    // Try primary NOAA feed - most recent and accurate data
    const data = await fetchJSON<any[]>('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
    return data.map(item => ({
      time: item.time_tag || item.timeTag,
      kp: Number(item.estimated_kp || item.kp || item.kp_index)
    }));
  } catch {
    try {
      // Try alternative NOAA feed - different data format
      const data = await fetchJSON<any[]>('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
      return data.map(row => ({
        time: row[0],
        kp: Number(row[1])
      }));
    } catch {
      // Fallback to local sample data - ensures app works offline
      return await fetchJSON<SpaceWeatherData[]>('/sample-spaceweather.json');
    }
  }
}

/**
 * Load conjunction events from local sample data
 * 
 * @returns Promise that resolves to an array of conjunction events
 */
export async function loadConjunctions(): Promise<ConjunctionEvent[]> {
  return await fetchJSON<ConjunctionEvent[]>('/sample-conjunctions.json');
}

/**
 * Load satellite options for the dropdown menu
 * 
 * @returns Promise that resolves to an array of satellite options
 */
export async function loadSatelliteOptions(): Promise<SatelliteOption[]> {
  return await fetchJSON<SatelliteOption[]>('/satellite-options.json');
}