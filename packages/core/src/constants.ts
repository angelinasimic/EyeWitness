// Constants for Space Situational Awareness System

export const DEFAULT_THRESHOLDS = {
  conjunction: {
    critical_pc: 1e-4,
    warning_miss_distance_km: 1.0,
  },
  space_weather: {
    kp_warning: 6,
    cme_hours_to_eta_critical: 18,
  },
} as const;

export const DEFAULT_POLLING_CONFIG = {
  donki: { interval_minutes: 60 },
  swpc_kp: { interval_minutes: 30 },
  swpc_alerts: { interval_minutes: 60 },
  celestrak_gp: { interval_minutes: 60 },
  socrates: { interval_minutes: 180 },
  spacetrack_cdm: { interval_minutes: 480, event_interval_minutes: 60 },
} as const;

export const DEFAULT_BASE_URLS = {
  CELESTRAK_BASE: 'https://celestrak.org',
  SWPC_BASE: 'https://services.swpc.noaa.gov',
  NASA_BASE: 'https://api.nasa.gov',
  SPACETRACK_BASE: 'https://www.space-track.org',
} as const;

export const SEVERITY_LEVELS = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
} as const;

export const ALERT_TYPES = {
  CONJUNCTION: 'conjunction',
  SPACE_WEATHER: 'space_weather',
} as const;

export const ACTION_TYPES = {
  MANEUVER: 'maneuver',
  SAFE_MODE: 'safe_mode',
  MONITOR: 'monitor',
} as const;

export const DECISION_STATUS = {
  PENDING: 'pending',
  EXECUTED: 'executed',
  REJECTED: 'rejected',
} as const;

export const WEBSOCKET_MESSAGE_TYPES = {
  ALERT: 'alert',
  DECISION: 'decision',
  SATELLITE_UPDATE: 'satellite_update',
  SPACE_WEATHER_UPDATE: 'space_weather_update',
} as const;

// Space constants
export const EARTH_RADIUS_KM = 6371;
export const EARTH_RADIUS_M = 6371000;
export const GRAVITATIONAL_CONSTANT = 3.986004418e14; // m³/s²

// Time constants
export const HOURS_TO_MS = 60 * 60 * 1000;
export const MINUTES_TO_MS = 60 * 1000;
export const DAYS_TO_MS = 24 * 60 * 60 * 1000;

// API rate limits (requests per hour)
export const RATE_LIMITS = {
  NASA: 1000,
  SPACETRACK: 300,
  SWPC: Infinity, // Public data, no rate limit
  CELESTRAK: Infinity, // Public data, no rate limit
} as const;

// Space-Track specific limits
export const SPACETRACK_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 30,
  MAX_REQUESTS_PER_HOUR: 300,
  CDM_QUERIES_PER_DAY: 3,
  EVENT_QUERIES_PER_HOUR: 1,
} as const;
