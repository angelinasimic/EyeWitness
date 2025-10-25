import { Satellite, ConjunctionEvent, SpaceWeatherData, RiskAlert } from '../types';

// Compute risk level based on miss distance
export function computeConjunctionRisk(missDistanceKm: number): 'Low' | 'Medium' | 'High' {
  if (missDistanceKm < 5) return 'High';
  if (missDistanceKm < 10) return 'Medium';
  return 'Low';
}

// Check if latest Kp index indicates space weather alert
export function getSpaceWeatherAlert(kpList: SpaceWeatherData[]): boolean {
  if (kpList.length === 0) return false;
  const latest = kpList[kpList.length - 1];
  return latest.kp >= 6;
}

// Attach conjunction events to satellites by name match
export function attachEventsToSatellites(
  satellites: Satellite[],
  events: ConjunctionEvent[]
): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  satellites.forEach(satellite => {
    events.forEach(event => {
      const nameMatch = 
        event.objectA.toLowerCase() === satellite.name.toLowerCase() ||
        event.objectB.toLowerCase() === satellite.name.toLowerCase();

      if (nameMatch) {
        const risk = computeConjunctionRisk(event.missDistanceKm);
        const action = risk === 'High' 
          ? 'Execute collision avoidance maneuver (plane-change burn)'
          : risk === 'Medium'
          ? 'Prepare for potential maneuver and monitor closely'
          : 'Monitor conjunction and update tracking';

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

// Create space weather alerts for each satellite if Kp ≥ 6
export function createSpaceWeatherAlerts(satellites: Satellite[], kpList: SpaceWeatherData[]): RiskAlert[] {
  if (!getSpaceWeatherAlert(kpList)) return [];

  const latest = kpList[kpList.length - 1];
  const alerts: RiskAlert[] = [];

  satellites.forEach(satellite => {
    alerts.push({
      id: `sw-${satellite.id}-${latest.time}`,
      type: 'space_weather',
      severity: 'High',
      satellite: satellite.name,
      message: `Space weather alert: Kp index ${latest.kp}`,
      suggestedAction: 'Activate safe mode and postpone all maneuvers',
      timestamp: new Date().toISOString(),
      acknowledged: false
    });
  });

  return alerts;
}