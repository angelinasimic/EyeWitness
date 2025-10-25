import { z } from 'zod';

// Zod schemas for runtime validation

export const SatelliteInputSchema = z.object({
  name: z.string().min(1),
  noradId: z.string().nullable(),
  tle: z.string().nullable(),
  omm: z.object({}).nullable(),
});

export const ConjunctionAlertSchema = z.object({
  tca: z.string().datetime(),
  miss_distance_km: z.number().positive(),
  relative_velocity_kms: z.number(),
  primary_norad: z.string(),
  secondary_norad: z.string(),
  pc: z.number().nullable(),
  sigma_ran_km: z.number().nullable(),
  sigma_tan_km: z.number().nullable(),
  sigma_norm_km: z.number().nullable(),
  source: z.string(),
  link: z.string(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export const SpaceWeatherAlertSchema = z.object({
  type: z.string(),
  kp: z.number().nullable(),
  cme_eta_start: z.string().datetime().nullable(),
  cme_eta_end: z.string().datetime().nullable(),
  message: z.string().nullable(),
  source: z.string(),
  link: z.string(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export const SuggestedActionSchema = z.object({
  id: z.string(),
  type: z.enum(['maneuver', 'safe_mode', 'monitor']),
  deltaV_mps: z.number().nullable(),
  direction: z.string().nullable(),
  rationale: z.string(),
  expected_risk_delta: z.number().nullable(),
  window_start: z.string().datetime().nullable(),
  window_end: z.string().datetime().nullable(),
});

export const SatelliteSchema = z.object({
  id: z.string(),
  name: z.string(),
  noradId: z.string(),
  tle: z.string().optional(),
  omm: z.object({}).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  velocity: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  lastUpdated: z.string().datetime(),
});

export const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['conjunction', 'space_weather']),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  title: z.string(),
  description: z.string(),
  timestamp: z.string().datetime(),
  source: z.string(),
  link: z.string().optional(),
  data: z.union([ConjunctionAlertSchema, SpaceWeatherAlertSchema]),
});

export const DecisionSchema = z.object({
  id: z.string(),
  alertId: z.string(),
  suggestedActions: z.array(SuggestedActionSchema),
  status: z.enum(['pending', 'executed', 'rejected']),
  createdAt: z.string().datetime(),
  executedAt: z.string().datetime().optional(),
  executionLog: z.string().optional(),
});

// Data source schemas
export const DonkiCmeDataSchema = z.object({
  startTime: z.string(),
  link: z.string(),
}).passthrough();

export const DonkiNotificationDataSchema = z.object({
  messageType: z.string(),
  messageIssueTime: z.string(),
  messageBody: z.string(),
}).passthrough();

export const SwpcKpDataSchema = z.object({
  time_tag: z.string(),
  Kp: z.number(),
  a_running: z.number(),
  station_count: z.number(),
});

export const SwpcAlertDataSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
}).passthrough();

export const CelestrakGpDataSchema = z.object({}).passthrough();

export const SocratesDataSchema = z.object({
  TCA: z.string(),
  MISS_DISTANCE: z.number(),
  REL_VEL: z.number(),
  SAT1: z.string(),
  SAT2: z.string(),
}).passthrough();

export const SpacetrackCdmDataSchema = z.object({}).passthrough();

// Configuration schemas
export const ThresholdsSchema = z.object({
  conjunction: z.object({
    critical_pc: z.number().positive(),
    warning_miss_distance_km: z.number().positive(),
  }),
  space_weather: z.object({
    kp_warning: z.number().min(0).max(9),
    cme_hours_to_eta_critical: z.number().positive(),
  }),
});

export const PollingConfigSchema = z.object({
  donki: z.object({ interval_minutes: z.number().positive() }),
  swpc_kp: z.object({ interval_minutes: z.number().positive() }),
  swpc_alerts: z.object({ interval_minutes: z.number().positive() }),
  celestrak_gp: z.object({ interval_minutes: z.number().positive() }),
  socrates: z.object({ interval_minutes: z.number().positive() }),
  spacetrack_cdm: z.object({ 
    interval_minutes: z.number().positive(),
    event_interval_minutes: z.number().positive(),
  }),
});

// WebSocket message schema
export const WebSocketMessageSchema = z.object({
  type: z.enum(['alert', 'decision', 'satellite_update', 'space_weather_update']),
  data: z.any(),
  timestamp: z.string().datetime(),
});

// API Response schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime(),
});

// Environment configuration schema
export const EnvConfigSchema = z.object({
  NASA_API_KEY: z.string().optional(),
  SPACETRACK_USER: z.string().optional(),
  SPACETRACK_PASS: z.string().optional(),
  CELESTRAK_BASE: z.string().url().optional(),
  SWPC_BASE: z.string().url().optional(),
  DEMO: z.boolean().optional(),
  JWT_SECRET: z.string().optional(),
});
