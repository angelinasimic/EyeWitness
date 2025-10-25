import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { SwpcKpData, SwpcAlertData, SwpcKpDataSchema, SwpcAlertDataSchema } from '@eyewitness/core';

export class SwpcClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'https://services.swpc.noaa.gov') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'Space-Situational-Awareness/1.0 (Educational Project)',
      },
    });
  }

  async getKpData(): Promise<SwpcKpData[]> {
    try {
      const response = await this.client.get('/products/noaa-planetary-k-index.json');
      const data = response.data;

      if (!Array.isArray(data)) {
        logger.warn('Invalid Kp data format received');
        return [];
      }

      // Skip header row and parse data
      const kpData = data.slice(1).map((row: any[]) => {
        if (Array.isArray(row) && row.length >= 4) {
          return SwpcKpDataSchema.parse({
            time_tag: row[0],
            Kp: parseFloat(row[1]) || 0,
            a_running: parseFloat(row[2]) || 0,
            station_count: parseInt(row[3]) || 0,
          });
        }
        return null;
      }).filter((item): item is SwpcKpData => item !== null);

      return kpData;
    } catch (error) {
      logger.error('Failed to fetch SWPC Kp data:', error);
      return [];
    }
  }

  async getAlerts(): Promise<SwpcAlertData[]> {
    try {
      const response = await this.client.get('/products/alerts.json');
      const data = response.data;

      // Handle both JSON array and text lines
      let alerts: any[] = [];
      
      if (Array.isArray(data)) {
        alerts = data;
      } else if (typeof data === 'string') {
        // Parse text lines
        const lines = data.split('\n').filter(line => line.trim());
        alerts = lines.map(line => ({ message: line, timestamp: new Date().toISOString() }));
      } else {
        logger.warn('Invalid alerts data format received');
        return [];
      }

      return alerts.map(alert => SwpcAlertDataSchema.parse(alert));
    } catch (error: any) {
      logger.error('Failed to fetch SWPC alerts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      return [];
    }
  }

  isAvailable(): boolean {
    return true; // SWPC is always available (public data)
  }
}
