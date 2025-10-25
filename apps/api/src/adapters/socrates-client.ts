import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { SocratesData, SocratesDataSchema } from '@eyewitness/core';

export class SocratesClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'https://celestrak.org/SOCRATES') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
    });
  }

  async getConjunctionData(maxPerPage: number = 200): Promise<SocratesData[]> {
    try {
      // SOCRATES Plus has changed to a web interface, no longer provides direct CSV access
      // For now, return empty array until we implement HTML parsing or find alternative
      logger.warn('SOCRATES Plus no longer provides direct CSV access - using web interface');
      return [];
    } catch (error: any) {
      logger.error('Failed to fetch SOCRATES data:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      return [];
    }
  }

  private parseCsvData(csvData: string): SocratesData[] {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      logger.warn('Invalid CSV format - no header or data rows');
      return [];
    }

    // Parse header row with more robust splitting
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toUpperCase());
    const data: SocratesData[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // More robust CSV parsing that handles quoted fields
      const values = this.parseCsvLine(line);
      if (values.length !== headers.length) {
        logger.warn(`Row ${i} has ${values.length} columns, expected ${headers.length}, skipping`);
        continue;
      }

      try {
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        // Map to expected schema with better field mapping
        const socratesData: SocratesData = {
          TCA: rowData['TCA'] || rowData['TCA_TIME'] || '',
          MISS_DISTANCE: parseFloat(rowData['MISS_DISTANCE'] || rowData['MISS_DIST_KM'] || '0') || 0,
          REL_VEL: parseFloat(rowData['REL_VEL'] || rowData['REL_VELOCITY'] || '0') || 0,
          SAT1: rowData['SAT1'] || rowData['OBJECT1'] || '',
          SAT2: rowData['SAT2'] || rowData['OBJECT2'] || '',
        };

        data.push(SocratesDataSchema.parse(socratesData));
      } catch (error) {
        logger.warn(`Failed to parse row ${i}:`, error);
        continue;
      }
    }

    return data;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  isAvailable(): boolean {
    return true; // SOCRATES is always available (public data)
  }
}
