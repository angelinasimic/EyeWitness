import { config as dotenvConfig } from 'dotenv';
import { EnvConfigSchema } from '@eyewitness/core';
import path from 'path';

// Load .env from the root directory
dotenvConfig({ path: path.join(__dirname, '../../../.env') });

export const config = {
  NASA_API_KEY: process.env.NASA_API_KEY,
  SPACETRACK_USER: process.env.SPACETRACK_USER,
  SPACETRACK_PASS: process.env.SPACETRACK_PASS,
  CELESTRAK_BASE: process.env.CELESTRAK_BASE || 'https://celestrak.org',
  SWPC_BASE: process.env.SWPC_BASE || 'https://services.swpc.noaa.gov',
  DEMO: process.env.DEMO === 'true',
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
