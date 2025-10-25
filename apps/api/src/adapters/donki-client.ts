import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { DonkiCmeData, DonkiNotificationData, DonkiCmeDataSchema, DonkiNotificationDataSchema } from '@space-sa/core';

export class DonkiClient {
  private client: AxiosInstance;
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
    this.client = axios.create({
      baseURL: 'https://api.nasa.gov/DONKI',
      timeout: 30000,
    });
  }

  async getCmeData(startDate: string, endDate: string): Promise<DonkiCmeData[]> {
    if (!this.apiKey) {
      logger.warn('NASA API key not provided, skipping DONKI CME data');
      return [];
    }

    try {
      const response = await this.client.get('/CME', {
        params: {
          startDate,
          endDate,
          api_key: this.apiKey,
        },
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        logger.warn('Invalid CME data format received');
        return [];
      }

      return data.map(item => DonkiCmeDataSchema.parse(item));
    } catch (error) {
      logger.error('Failed to fetch DONKI CME data:', error);
      return [];
    }
  }

  async getNotifications(startDate: string, endDate: string): Promise<DonkiNotificationData[]> {
    if (!this.apiKey) {
      logger.warn('NASA API key not provided, skipping DONKI notifications');
      return [];
    }

    try {
      const response = await this.client.get('/notifications', {
        params: {
          type: 'all',
          startDate,
          endDate,
          api_key: this.apiKey,
        },
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        logger.warn('Invalid notifications data format received');
        return [];
      }

      return data.map(item => DonkiNotificationDataSchema.parse(item));
    } catch (error) {
      logger.error('Failed to fetch DONKI notifications:', error);
      return [];
    }
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }
}
