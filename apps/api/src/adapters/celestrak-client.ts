import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { CelestrakGpData, CelestrakGpDataSchema } from '@space-sa/core';

export class CelestrakClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'https://celestrak.org') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
    });
  }

  async getGpData(group: string = 'active', format: string = 'json'): Promise<CelestrakGpData[]> {
    try {
      const response = await this.client.get('/NORAD/elements/gp.php', {
        params: {
          GROUP: group,
          FORMAT: format,
        },
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        logger.warn('Invalid GP data format received');
        return [];
      }

      return data.map(item => CelestrakGpDataSchema.parse(item));
    } catch (error) {
      logger.error('Failed to fetch CelesTrak GP data:', error);
      return [];
    }
  }

  async getTleData(group: string = 'active'): Promise<string> {
    try {
      const response = await this.client.get('/NORAD/elements/gp.php', {
        params: {
          GROUP: group,
          FORMAT: 'tle',
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch CelesTrak TLE data:', error);
      return '';
    }
  }

  async getOmmData(group: string = 'active'): Promise<CelestrakGpData[]> {
    try {
      const response = await this.client.get('/NORAD/elements/gp.php', {
        params: {
          GROUP: group,
          FORMAT: 'omm',
        },
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        logger.warn('Invalid OMM data format received');
        return [];
      }

      return data.map(item => CelestrakGpDataSchema.parse(item));
    } catch (error) {
      logger.error('Failed to fetch CelesTrak OMM data:', error);
      return [];
    }
  }

  async getSatelliteData(noradId: string): Promise<CelestrakGpData | null> {
    try {
      const response = await this.client.get('/NORAD/elements/gp.php', {
        params: {
          CATNR: noradId,
          FORMAT: 'json',
        },
      });

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        return CelestrakGpDataSchema.parse(data[0]);
      }

      return null;
    } catch (error) {
      logger.error(`Failed to fetch satellite data for NORAD ID ${noradId}:`, error);
      return null;
    }
  }

  isAvailable(): boolean {
    return true; // CelesTrak is always available (public data)
  }
}
