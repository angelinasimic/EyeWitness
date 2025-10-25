import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DonkiClient } from '../adapters/donki-client';
import { SwpcClient } from '../adapters/swpc-client';
import { config } from '../config';
import { logger } from '../utils/logger';

export async function spaceWeatherRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {
  const donkiClient = new DonkiClient(config.NASA_API_KEY);
  const swpcClient = new SwpcClient(config.SWPC_BASE);

  // Get space weather data
  fastify.get('/', async (request, reply) => {
    try {
      const { days = '7' } = request.query as { days?: string };
      const daysNum = parseInt(days);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch data from all available sources
      const [cmeData, notifications, kpData, alerts] = await Promise.allSettled([
        donkiClient.getCmeData(startDateStr, endDateStr),
        donkiClient.getNotifications(startDateStr, endDateStr),
        swpcClient.getKpData(),
        swpcClient.getAlerts(),
      ]);

      const spaceWeatherData = {
        cme: cmeData.status === 'fulfilled' ? cmeData.value : [],
        notifications: notifications.status === 'fulfilled' ? notifications.value : [],
        kp: kpData.status === 'fulfilled' ? kpData.value : [],
        alerts: alerts.status === 'fulfilled' ? alerts.value : [],
        sources: {
          donki: donkiClient.isAvailable(),
          swpc: swpcClient.isAvailable(),
        },
        lastUpdated: new Date().toISOString(),
      };

      reply.send({
        success: true,
        data: spaceWeatherData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get space weather data:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve space weather data',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get Kp index data
  fastify.get('/kp', async (request, reply) => {
    try {
      const kpData = await swpcClient.getKpData();
      
      reply.send({
        success: true,
        data: kpData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get Kp data:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve Kp data',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get CME data
  fastify.get('/cme', async (request, reply) => {
    try {
      if (!donkiClient.isAvailable()) {
        reply.code(503).send({
          success: false,
          error: 'DONKI service not available',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { days = '7' } = request.query as { days?: string };
      const daysNum = parseInt(days);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const cmeData = await donkiClient.getCmeData(startDateStr, endDateStr);
      
      reply.send({
        success: true,
        data: cmeData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get CME data:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve CME data',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get notifications
  fastify.get('/notifications', async (request, reply) => {
    try {
      if (!donkiClient.isAvailable()) {
        reply.code(503).send({
          success: false,
          error: 'DONKI service not available',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { days = '7' } = request.query as { days?: string };
      const daysNum = parseInt(days);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const notifications = await donkiClient.getNotifications(startDateStr, endDateStr);
      
      reply.send({
        success: true,
        data: notifications,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get notifications:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve notifications',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
