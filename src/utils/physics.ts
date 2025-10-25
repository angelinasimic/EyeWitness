/**
 * Physics utilities for orbital mechanics calculations
 */

/**
 * Calculate orbital velocity for a given orbital radius
 * @param radius - Orbital radius in meters
 * @returns Orbital velocity in m/s
 */
export function calculateOrbitalVelocity(radius: number): number {
  const G = 6.67430e-11; // Gravitational constant
  const M = 5.972e24;     // Earth mass in kg
  return Math.sqrt((G * M) / radius);
}

/**
 * Convert altitude in km to orbital radius in meters
 * @param altitudeKm - Altitude above Earth's surface in kilometers
 * @returns Orbital radius in meters
 */
export function altitudeToRadius(altitudeKm: number): number {
  const earthRadius = 6371; // Earth radius in km
  return (earthRadius + altitudeKm) * 1000; // Convert to meters
}

/**
 * Convert orbital radius in meters to altitude in km
 * @param radius - Orbital radius in meters
 * @returns Altitude above Earth's surface in kilometers
 */
export function radiusToAltitude(radius: number): number {
  const earthRadius = 6371000; // Earth radius in meters
  return (radius - earthRadius) / 1000; // Convert to km
}
