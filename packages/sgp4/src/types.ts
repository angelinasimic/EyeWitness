// Types for SGP4 propagation

export interface Position {
  x: number; // km
  y: number; // km
  z: number; // km
}

export interface Velocity {
  x: number; // km/s
  y: number; // km/s
  z: number; // km/s
}

export interface StateVector {
  position: Position;
  velocity: Velocity;
}

export interface ECI {
  x: number; // km
  y: number; // km
  z: number; // km
  vx: number; // km/s
  vy: number; // km/s
  vz: number; // km/s
}

export interface ECEF {
  x: number; // km
  y: number; // km
  z: number; // km
  vx: number; // km/s
  vy: number; // km/s
  vz: number; // km/s
}

export interface LLA {
  latitude: number; // degrees
  longitude: number; // degrees
  altitude: number; // km
}

export interface TLE {
  line1: string;
  line2: string;
}

export interface PropagationResult {
  position: Position;
  velocity: Velocity;
  timestamp: Date;
}

export interface PropagationOptions {
  startTime?: Date;
  endTime?: Date;
  stepSize?: number; // minutes
}

export interface CoordinateTransform {
  eciToEcef: (eci: ECI, gmst: number) => ECEF;
  ecefToEci: (ecef: ECEF, gmst: number) => ECI;
  ecefToLla: (ecef: ECEF) => LLA;
  llaToEcef: (lla: LLA) => ECEF;
}
