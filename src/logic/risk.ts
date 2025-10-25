import { Satellite, ConjunctionEvent, SpaceWeatherData, RiskAlert } from '../types';

/**
 * Compute risk level for conjunction based on miss distance
 * 
 * @param missDistanceKm - Predicted closest approach distance in kilometers
 * @returns Risk level: 'Low', 'Medium', or 'High'
 */
export function computeConjunctionRisk(missDistanceKm: number): 'Low' | 'Medium' | 'High' {
  if (missDistanceKm < 5) return 'High';
  if (missDistanceKm < 10) return 'Medium';
  return 'Low';
}

/**
 * Check if latest Kp index indicates space weather alert
 * 
 * @param kpList - Array of space weather data points
 * @returns True if the latest Kp index is >= 6 (alert level)
 */
export function getSpaceWeatherAlert(kpList: SpaceWeatherData[]): boolean {
  if (kpList.length === 0) return false;
  const latest = kpList[kpList.length - 1];
  return latest.kp >= 6;
}

/**
 * Attach conjunction events to satellites by name or altitude band
 * 
 * @param satellites - Array of satellites being tracked
 * @param events - Array of conjunction events from external sources
 * @returns Array of risk alerts for matched satellites
 */
export function attachEventsToSatellites(
  satellites: Satellite[],
  events: ConjunctionEvent[]
): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Check each satellite against each conjunction event
  satellites.forEach(satellite => {
    events.forEach(event => {
      // Check name match (case-insensitive substring)
      // This catches cases where satellite names appear in object names
      const nameMatch = 
        event.objectA.toLowerCase().includes(satellite.name.toLowerCase()) ||
        event.objectB.toLowerCase().includes(satellite.name.toLowerCase());

      // Check altitude band match (±50 km)
      // Objects in similar altitude ranges are more likely to collide
      const altitudeMatch = 
        Math.abs(event.altitudeKm - satellite.altitudeKm) <= 50;

      // Create alert if either name or altitude matches
      if (nameMatch || altitudeMatch) {
        const risk = computeConjunctionRisk(event.missDistanceKm);
        const action = risk === 'High' 
          ? 'Suggest small plane-change burn'
          : 'Monitor closely';

        alerts.push({
          id: `conj-${satellite.id}-${event.tca}`,
          type: 'conjunction',
          severity: risk,
          satellite: satellite.name,
          message: `Close approach: ${event.objectA} & ${event.objectB} at ${event.missDistanceKm.toFixed(1)}km`,
          suggestedAction: action,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
    });
  });

  return alerts;
}

/**
 * Create space weather alerts if Kp index indicates severe conditions
 * 
 * @param kpList - Array of space weather data points
 * @returns Array containing one space weather alert if Kp ≥ 6, empty array otherwise
 */
export function createSpaceWeatherAlerts(kpList: SpaceWeatherData[]): RiskAlert[] {
  if (!getSpaceWeatherAlert(kpList)) return [];

  const latest = kpList[kpList.length - 1];
  return [{
    id: `sw-${latest.time}`,
    type: 'space_weather',
    severity: 'High',
    message: `Space weather alert: Kp index ${latest.kp}`,
    suggestedAction: 'Suggest safe mode; postpone maneuvers',
    timestamp: new Date().toISOString(),
    acknowledged: false
  }];
}