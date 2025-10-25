import * as satellite from 'satellite.js';
import { ECI, ECEF, LLA } from './types';

/**
 * Coordinate system transformations
 */
export class CoordinateTransforms {
  /**
   * Convert ECI to ECEF coordinates
   */
  static eciToEcef(eci: ECI, gmst: number): ECEF {
    const position = { x: eci.x, y: eci.y, z: eci.z };
    const velocity = { x: eci.vx, y: eci.vy, z: eci.vz };
    
    const ecefPosition = satellite.eciToEcf(position, gmst);
    const ecefVelocity = satellite.eciToEcf(velocity, gmst);
    
    return {
      x: ecefPosition.x,
      y: ecefPosition.y,
      z: ecefPosition.z,
      vx: ecefVelocity.x,
      vy: ecefVelocity.y,
      vz: ecefVelocity.z,
    };
  }

  /**
   * Convert ECEF to ECI coordinates
   */
  static ecefToEci(ecef: ECEF, gmst: number): ECI {
    const position = { x: ecef.x, y: ecef.y, z: ecef.z };
    const velocity = { x: ecef.vx, y: ecef.vy, z: ecef.vz };
    
    const eciPosition = satellite.ecfToEci(position, gmst);
    const eciVelocity = satellite.ecfToEci(velocity, gmst);
    
    return {
      x: eciPosition.x,
      y: eciPosition.y,
      z: eciPosition.z,
      vx: eciVelocity.x,
      vy: eciVelocity.y,
      vz: eciVelocity.z,
    };
  }

  /**
   * Convert ECEF to LLA coordinates
   */
  static ecefToLla(ecef: ECEF): LLA {
    const position = { x: ecef.x, y: ecef.y, z: ecef.z };
    const lla = satellite.eciToGeodetic(position, satellite.gstime(new Date()));
    
    return {
      latitude: lla.latitude,
      longitude: lla.longitude,
      altitude: lla.height,
    };
  }

  /**
   * Convert LLA to ECEF coordinates
   */
  static llaToEcef(lla: LLA): ECEF {
    const geodeticLocation = {
      latitude: lla.latitude,
      longitude: lla.longitude,
      height: lla.altitude,
    };
    const position = satellite.geodeticToEcf(geodeticLocation);
    
    return {
      x: position.x,
      y: position.y,
      z: position.z,
      vx: 0, // No velocity information from LLA
      vy: 0,
      vz: 0,
    };
  }

  /**
   * Calculate Greenwich Mean Sidereal Time
   */
  static calculateGMST(date: Date): number {
    return satellite.gstime(date);
  }

  /**
   * Calculate Julian Date
   */
  static calculateJulianDate(date: Date): number {
    // Simple Julian date calculation
    const time = date.getTime();
    const jd = (time / 86400000) + 2440587.5;
    return jd;
  }

  /**
   * Calculate distance between two ECI positions
   */
  static distanceEci(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate relative velocity between two ECI velocities
   */
  static relativeVelocityEci(vel1: { x: number; y: number; z: number }, vel2: { x: number; y: number; z: number }): number {
    const dvx = vel2.x - vel1.x;
    const dvy = vel2.y - vel1.y;
    const dvz = vel2.z - vel1.z;
    return Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);
  }

  /**
   * Calculate RIC (Radial, In-track, Cross-track) components
   */
  static calculateRIC(
    primaryPos: { x: number; y: number; z: number },
    primaryVel: { x: number; y: number; z: number },
    secondaryPos: { x: number; y: number; z: number },
    secondaryVel: { x: number; y: number; z: number }
  ): { radial: number; inTrack: number; crossTrack: number } {
    // Relative position vector
    const relPos = {
      x: secondaryPos.x - primaryPos.x,
      y: secondaryPos.y - primaryPos.y,
      z: secondaryPos.z - primaryPos.z,
    };

    // Relative velocity vector
    const relVel = {
      x: secondaryVel.x - primaryVel.x,
      y: secondaryVel.y - primaryVel.y,
      z: secondaryVel.z - primaryVel.z,
    };

    // Calculate unit vectors
    const posMagnitude = Math.sqrt(relPos.x * relPos.x + relPos.y * relPos.y + relPos.z * relPos.z);
    const velMagnitude = Math.sqrt(primaryVel.x * primaryVel.x + primaryVel.y * primaryVel.y + primaryVel.z * primaryVel.z);

    if (posMagnitude === 0 || velMagnitude === 0) {
      return { radial: 0, inTrack: 0, crossTrack: 0 };
    }

    // Radial unit vector (along position vector)
    const radial = {
      x: relPos.x / posMagnitude,
      y: relPos.y / posMagnitude,
      z: relPos.z / posMagnitude,
    };

    // In-track unit vector (along velocity vector)
    const inTrack = {
      x: primaryVel.x / velMagnitude,
      y: primaryVel.y / velMagnitude,
      z: primaryVel.z / velMagnitude,
    };

    // Cross-track unit vector (perpendicular to both)
    const crossTrack = {
      x: radial.y * inTrack.z - radial.z * inTrack.y,
      y: radial.z * inTrack.x - radial.x * inTrack.z,
      z: radial.x * inTrack.y - radial.y * inTrack.x,
    };

    // Calculate RIC components
    const radialComponent = relPos.x * radial.x + relPos.y * radial.y + relPos.z * radial.z;
    const inTrackComponent = relPos.x * inTrack.x + relPos.y * inTrack.y + relPos.z * inTrack.z;
    const crossTrackComponent = relPos.x * crossTrack.x + relPos.y * crossTrack.y + relPos.z * crossTrack.z;

    return {
      radial: radialComponent,
      inTrack: inTrackComponent,
      crossTrack: crossTrackComponent,
    };
  }
}
