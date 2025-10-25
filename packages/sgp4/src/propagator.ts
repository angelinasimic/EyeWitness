import * as satellite from 'satellite.js';
import { TLE, PropagationResult, PropagationOptions, StateVector, ECI } from './types';

/**
 * SGP4 satellite propagator wrapper
 */
export class SGP4Propagator {
  private satrec: satellite.SatRec;

  constructor(tle: TLE) {
    this.satrec = satellite.twoline2satrec(tle.line1, tle.line2);
  }

  /**
   * Propagate satellite position and velocity at a specific time
   */
  propagate(time: Date): PropagationResult {
    const positionAndVelocity = satellite.propagate(this.satrec, time);
    
    if (positionAndVelocity.position === false || positionAndVelocity.velocity === false) {
      throw new Error('Propagation failed - satellite may have decayed');
    }

    const position = positionAndVelocity.position as satellite.EciVec3<number>;
    const velocity = positionAndVelocity.velocity as satellite.EciVec3<number>;

    return {
      position: {
        x: position.x,
        y: position.y,
        z: position.z,
      },
      velocity: {
        x: velocity.x,
        y: velocity.y,
        z: velocity.z,
      },
      timestamp: time,
    };
  }

  /**
   * Propagate satellite over a time range
   */
  propagateRange(options: PropagationOptions): PropagationResult[] {
    const { startTime = new Date(), endTime, stepSize = 1 } = options;
    const results: PropagationResult[] = [];
    
    let currentTime = new Date(startTime);
    const end = endTime || new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // Default 24 hours
    
    while (currentTime <= end) {
      try {
        const result = this.propagate(currentTime);
        results.push(result);
      } catch (error) {
        console.warn(`Propagation failed at ${currentTime.toISOString()}:`, error);
        break;
      }
      
      currentTime = new Date(currentTime.getTime() + stepSize * 60 * 1000);
    }
    
    return results;
  }

  /**
   * Get satellite orbital elements
   */
  getOrbitalElements(): satellite.SatRec {
    return this.satrec;
  }

  /**
   * Check if satellite is still active
   */
  isActive(): boolean {
    return this.satrec.error === 0;
  }

  /**
   * Get satellite name from TLE
   */
  getName(): string {
    return this.satrec.satnum.toString();
  }

  /**
   * Get satellite NORAD ID
   */
  getNoradId(): string {
    return this.satrec.satnum.toString();
  }

  /**
   * Get satellite epoch
   */
  getEpoch(): Date {
    return new Date(this.satrec.jdsatepoch);
  }

  /**
   * Get satellite period in minutes
   */
  getPeriod(): number {
    return this.satrec.no * 60; // Convert from radians per minute to minutes
  }

  /**
   * Get satellite inclination in degrees
   */
  getInclination(): number {
    return (this.satrec.inclo * 180) / Math.PI;
  }

  /**
   * Get satellite eccentricity
   */
  getEccentricity(): number {
    return this.satrec.ecco;
  }

  /**
   * Get satellite right ascension of ascending node in degrees
   */
  getRAAN(): number {
    return (this.satrec.nodeo * 180) / Math.PI;
  }

  /**
   * Get satellite argument of perigee in degrees
   */
  getArgumentOfPerigee(): number {
    return (this.satrec.argpo * 180) / Math.PI;
  }

  /**
   * Get satellite mean anomaly in degrees
   */
  getMeanAnomaly(): number {
    return (this.satrec.mo * 180) / Math.PI;
  }

  /**
   * Get satellite mean motion in revolutions per day
   */
  getMeanMotion(): number {
    return this.satrec.no * 60 * 24 / (2 * Math.PI);
  }

  /**
   * Get satellite semi-major axis in km
   */
  getSemiMajorAxis(): number {
    const mu = 3.986004418e14; // Earth's gravitational parameter
    const n = this.satrec.no * 60; // Convert to radians per second
    return Math.pow(mu / (n * n), 1/3) / 1000; // Convert to km
  }

  /**
   * Get satellite apogee altitude in km
   */
  getApogee(): number {
    const a = this.getSemiMajorAxis();
    const e = this.getEccentricity();
    return a * (1 + e) - 6371; // Subtract Earth radius
  }

  /**
   * Get satellite perigee altitude in km
   */
  getPerigee(): number {
    const a = this.getSemiMajorAxis();
    const e = this.getEccentricity();
    return a * (1 - e) - 6371; // Subtract Earth radius
  }
}

/**
 * Utility function to create a propagator from TLE strings
 */
export function createPropagator(tleLine1: string, tleLine2: string): SGP4Propagator {
  const tle: TLE = { line1: tleLine1, line2: tleLine2 };
  return new SGP4Propagator(tle);
}

/**
 * Utility function to parse TLE from string
 */
export function parseTLE(tleString: string): TLE {
  const lines = tleString.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('Invalid TLE format - must have at least 2 lines');
  }
  
  return {
    line1: lines[0].trim(),
    line2: lines[1].trim(),
  };
}

/**
 * Utility function to validate TLE format
 */
export function validateTLE(tle: TLE): boolean {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    return satrec.error === 0;
  } catch {
    return false;
  }
}
