import cron from 'node-cron';
import { logger } from '../utils/logger';
import { WebSocketManager } from '../websocket/manager';
import { DonkiClient } from '../adapters/donki-client';
import { SwpcClient } from '../adapters/swpc-client';
import { CelestrakClient } from '../adapters/celestrak-client';
import { SocratesClient } from '../adapters/socrates-client';
import { SpacetrackClient } from '../adapters/spacetrack-client';
import { config } from '../config';
import { DEFAULT_POLLING_CONFIG } from '@eyewitness/core';

export class PollingService {
  private wsManager: WebSocketManager;
  private donkiClient: DonkiClient;
  private swpcClient: SwpcClient;
  private celestrakClient: CelestrakClient;
  private socratesClient: SocratesClient;
  private spacetrackClient: SpacetrackClient;
  private pollingConfig = DEFAULT_POLLING_CONFIG;

  constructor(wsManager: WebSocketManager) {
    this.wsManager = wsManager;
    this.donkiClient = new DonkiClient(config.NASA_API_KEY);
    this.swpcClient = new SwpcClient(config.SWPC_BASE);
    this.celestrakClient = new CelestrakClient(config.CELESTRAK_BASE);
    this.socratesClient = new SocratesClient();
    this.spacetrackClient = new SpacetrackClient(config.SPACETRACK_USER, config.SPACETRACK_PASS);
  }

  async start(): Promise<void> {
    logger.info('Starting polling service...');

    // Start DONKI polling (hourly)
    if (this.donkiClient.isAvailable()) {
      cron.schedule(`*/${this.pollingConfig.donki.interval_minutes} * * * *`, async () => {
        await this.pollDonki();
      });
      logger.info(`DONKI polling started (every ${this.pollingConfig.donki.interval_minutes} minutes)`);
    } else {
      logger.warn('DONKI client not available, skipping polling');
    }

    // Start SWPC Kp polling (30 minutes)
    if (this.swpcClient.isAvailable()) {
      cron.schedule(`*/${this.pollingConfig.swpc_kp.interval_minutes} * * * *`, async () => {
        await this.pollSwpcKp();
      });
      logger.info(`SWPC Kp polling started (every ${this.pollingConfig.swpc_kp.interval_minutes} minutes)`);
    } else {
      logger.warn('SWPC client not available, skipping polling');
    }

    // Start SWPC alerts polling (10 minutes)
    if (this.swpcClient.isAvailable()) {
      cron.schedule(`*/${this.pollingConfig.swpc_alerts.interval_minutes} * * * *`, async () => {
        await this.pollSwpcAlerts();
      });
      logger.info(`SWPC alerts polling started (every ${this.pollingConfig.swpc_alerts.interval_minutes} minutes)`);
    }

    // Start CelesTrak polling (hourly)
    if (this.celestrakClient.isAvailable()) {
      cron.schedule(`*/${this.pollingConfig.celestrak_gp.interval_minutes} * * * *`, async () => {
        await this.pollCelestrak();
      });
      logger.info(`CelesTrak polling started (every ${this.pollingConfig.celestrak_gp.interval_minutes} minutes)`);
    }

    // Start SOCRATES polling (3 hours)
    if (this.socratesClient.isAvailable()) {
      cron.schedule(`*/${this.pollingConfig.socrates.interval_minutes} * * * *`, async () => {
        await this.pollSocrates();
      });
      logger.info(`SOCRATES polling started (every ${this.pollingConfig.socrates.interval_minutes} minutes)`);
    }

    // Start Space-Track polling (8 hours)
    if (this.spacetrackClient.isAvailable()) {
      cron.schedule(`*/${this.pollingConfig.spacetrack_cdm.interval_minutes} * * * *`, async () => {
        await this.pollSpacetrack();
      });
      logger.info(`Space-Track polling started (every ${this.pollingConfig.spacetrack_cdm.interval_minutes} minutes)`);
    } else {
      logger.warn('Space-Track client not available, skipping polling');
    }

    // Run initial polls
    await this.runInitialPolls();
  }

  private async runInitialPolls(): Promise<void> {
    logger.info('Running initial data polls...');
    
    const promises = [];
    
    if (this.donkiClient.isAvailable()) {
      promises.push(this.pollDonki());
    }
    
    if (this.swpcClient.isAvailable()) {
      promises.push(this.pollSwpcKp());
      promises.push(this.pollSwpcAlerts());
    }
    
    if (this.celestrakClient.isAvailable()) {
      promises.push(this.pollCelestrak());
    }
    
    if (this.socratesClient.isAvailable()) {
      promises.push(this.pollSocrates());
    }
    
    if (this.spacetrackClient.isAvailable()) {
      promises.push(this.pollSpacetrack());
    }

    // Don't wait for initial polls to complete - run them in background
    Promise.allSettled(promises).then(() => {
      logger.info('Initial data polls completed');
    });
  }

  private async pollDonki(): Promise<void> {
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      const [cmeData, notifications] = await Promise.all([
        this.donkiClient.getCmeData(startDate, endDate),
        this.donkiClient.getNotifications(startDate, endDate),
      ]);

      if (cmeData.length > 0 || notifications.length > 0) {
        this.wsManager.broadcast({
          type: 'space_weather_update',
          data: { cmeData, notifications },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('DONKI polling failed:', error);
    }
  }

  private async pollSwpcKp(): Promise<void> {
    try {
      const kpData = await this.swpcClient.getKpData();
      
      if (kpData.length > 0) {
        this.wsManager.broadcast({
          type: 'space_weather_update',
          data: { kpData },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('SWPC Kp polling failed:', error);
    }
  }

  private async pollSwpcAlerts(): Promise<void> {
    try {
      const alerts = await this.swpcClient.getAlerts();
      
      if (alerts.length > 0) {
        this.wsManager.broadcast({
          type: 'alert',
          data: { alerts },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('SWPC alerts polling failed:', error);
    }
  }

  private async pollCelestrak(): Promise<void> {
    try {
      const gpData = await this.celestrakClient.getGpData();
      
      if (gpData.length > 0) {
        this.wsManager.broadcast({
          type: 'satellite_update',
          data: { gpData },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('CelesTrak polling failed:', error);
    }
  }

  private async pollSocrates(): Promise<void> {
    try {
      const conjunctionData = await this.socratesClient.getConjunctionData();
      
      if (conjunctionData.length > 0) {
        this.wsManager.broadcast({
          type: 'alert',
          data: { conjunctionData },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('SOCRATES polling failed:', error);
    }
  }

  private async pollSpacetrack(): Promise<void> {
    try {
      const cdmData = await this.spacetrackClient.getCdmData();
      
      if (cdmData.length > 0) {
        this.wsManager.broadcast({
          type: 'alert',
          data: { cdmData },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Space-Track polling failed:', error);
    }
  }
}
