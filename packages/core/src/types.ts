// Core types for Space Situational Awareness System

export interface SatelliteInput {
  name: string;
  noradId: string | null;
  tle: string | null;
  omm: object | null;
}

export interface ConjunctionAlert {
  tca: string; // Time of Closest Approach (ISO 8601)
  miss_distance_km: number;
  relative_velocity_kms: number;
  primary_norad: string;
  secondary_norad: string;
  pc: number | null; // Probability of Collision
  sigma_ran_km: number | null; // Radial uncertainty
  sigma_tan_km: number | null; // Tangential uncertainty
  sigma_norm_km: number | null; // Normal uncertainty
  source: string;
  link: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface SpaceWeatherAlert {
  type: string;
  kp: number | null;
  cme_eta_start: string | null; // CME ETA start (ISO 8601)
  cme_eta_end: string | null; // CME ETA end (ISO 8601)
  message: string | null;
  source: string;
  link: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface SuggestedAction {
  id: string;
  type: 'maneuver' | 'safe_mode' | 'monitor';
  deltaV_mps: number | null; // ΔV in m/s
  direction: string | null; // Direction description
  rationale: string;
  expected_risk_delta: number | null; // Expected risk reduction
  window_start: string | null; // Execution window start (ISO 8601)
  window_end: string | null; // Execution window end (ISO 8601)
}

export interface Satellite {
  id: string;
  name: string;
  noradId: string;
  tle?: string;
  omm?: object;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  velocity?: {
    x: number;
    y: number;
    z: number;
  };
  lastUpdated: string;
}

export interface Alert {
  id: string;
  type: 'conjunction' | 'space_weather';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  link?: string;
  data: ConjunctionAlert | SpaceWeatherAlert;
}

export interface Decision {
  id: string;
  alertId: string;
  suggestedActions: SuggestedAction[];
  status: 'pending' | 'executed' | 'rejected';
  createdAt: string;
  executedAt?: string;
  executionLog?: string;
}

// Data source types
export interface DonkiCmeData {
  startTime: string;
  link: string;
  [key: string]: any;
}

export interface DonkiNotificationData {
  messageType: string;
  messageIssueTime: string;
  messageBody: string;
  [key: string]: any;
}

export interface SwpcKpData {
  time_tag: string;
  Kp: number;
  a_running: number;
  station_count: number;
}

export interface SwpcAlertData {
  message: string;
  timestamp: string;
  [key: string]: any;
}

export interface CelestrakGpData {
  [key: string]: any;
}

export interface SocratesData {
  TCA: string;
  MISS_DISTANCE: number;
  REL_VEL: number;
  SAT1: string;
  SAT2: string;
  [key: string]: any;
}

export interface SpacetrackCdmData {
  [key: string]: any;
}

// Configuration types
export interface Thresholds {
  conjunction: {
    critical_pc: number;
    warning_miss_distance_km: number;
  };
  space_weather: {
    kp_warning: number;
    cme_hours_to_eta_critical: number;
  };
}

export interface PollingConfig {
  donki: { interval_minutes: number };
  swpc_kp: { interval_minutes: number };
  swpc_alerts: { interval_minutes: number };
  celestrak_gp: { interval_minutes: number };
  socrates: { interval_minutes: number };
  spacetrack_cdm: { interval_minutes: number; event_interval_minutes: number };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'alert' | 'decision' | 'satellite_update' | 'space_weather_update';
  data: any;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Environment configuration
export interface EnvConfig {
  NASA_API_KEY?: string;
  SPACETRACK_USER?: string;
  SPACETRACK_PASS?: string;
  CELESTRAK_BASE?: string;
  SWPC_BASE?: string;
  DEMO?: boolean;
  JWT_SECRET?: string;
}
