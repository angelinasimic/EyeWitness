import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { SpacetrackCdmData, SpacetrackCdmDataSchema } from '@space-sa/core';

export class SpacetrackClient {
  private client: AxiosInstance;
  private username: string | null;
  private password: string | null;
  private sessionCookie: string | null = null;
  private lastLogin: Date | null = null;
  private requestCount = 0;
  private lastRequestTime: Date | null = null;

  constructor(username?: string, password?: string) {
    this.username = username || null;
    this.password = password || null;
    this.client = axios.create({
      baseURL: 'https://www.space-track.org',
      timeout: 30000,
    });
  }

  async login(): Promise<boolean> {
    if (!this.username || !this.password) {
      logger.warn('Space-Track credentials not provided');
      return false;
    }

    try {
      const response = await this.client.post('/ajaxauth/login', 
        `identity=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.status === 200 && response.data.includes('success')) {
        this.sessionCookie = response.headers['set-cookie']?.[0] || null;
        this.lastLogin = new Date();
        this.requestCount = 0;
        logger.info('Successfully logged into Space-Track');
        return true;
      } else {
        logger.error('Failed to login to Space-Track');
        return false;
      }
    } catch (error) {
      logger.error('Failed to login to Space-Track:', error);
      return false;
    }
  }

  async getCdmData(limit: number = 100): Promise<SpacetrackCdmData[]> {
    if (!this.isLoggedIn()) {
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        return [];
      }
    }

    // Check rate limits
    if (!this.canMakeRequest()) {
      logger.warn('Rate limit exceeded, skipping Space-Track request');
      return [];
    }

    try {
      const response = await this.client.get('/basicspacedata/query/class/cdm_public', {
        params: {
          limit,
          format: 'json',
        },
        headers: {
          Cookie: this.sessionCookie,
        },
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        logger.warn('Invalid CDM data format received');
        return [];
      }

      this.requestCount++;
      this.lastRequestTime = new Date();

      return data.map(item => SpacetrackCdmDataSchema.parse(item));
    } catch (error) {
      logger.error('Failed to fetch Space-Track CDM data:', error);
      return [];
    }
  }

  private isLoggedIn(): boolean {
    if (!this.sessionCookie || !this.lastLogin) {
      return false;
    }

    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - this.lastLogin.getTime();
    return sessionAge < 24 * 60 * 60 * 1000;
  }

  private canMakeRequest(): boolean {
    if (!this.lastRequestTime) {
      return true;
    }

    const timeSinceLastRequest = Date.now() - this.lastRequestTime.getTime();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    // Reset request count if more than an hour has passed
    if (timeSinceLastRequest > oneHour) {
      this.requestCount = 0;
    }

    // Check rate limits
    if (timeSinceLastRequest < oneMinute && this.requestCount >= 30) {
      return false; // 30 requests per minute limit
    }

    if (this.requestCount >= 300) {
      return false; // 300 requests per hour limit
    }

    return true;
  }

  isAvailable(): boolean {
    return this.username !== null && this.password !== null;
  }
}
