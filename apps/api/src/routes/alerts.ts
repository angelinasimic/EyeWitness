import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { logger } from '../utils/logger';

// In-memory storage for demo purposes
const alerts = new Map<string, any>();

export async function alertRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {
  // Get all alerts
  fastify.get('/', async (request, reply) => {
    try {
      const { type, severity, limit } = request.query as { 
        type?: string; 
        severity?: string; 
        limit?: string; 
      };
      
      let alertList = Array.from(alerts.values());
      
      // Filter by type
      if (type) {
        alertList = alertList.filter(alert => alert.type === type);
      }
      
      // Filter by severity
      if (severity) {
        alertList = alertList.filter(alert => alert.severity === severity);
      }
      
      // Apply limit
      if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum)) {
          alertList = alertList.slice(0, limitNum);
        }
      }
      
      // Sort by timestamp (newest first)
      alertList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      reply.send({
        success: true,
        data: alertList,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get alerts:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve alerts',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get specific alert
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const alert = alerts.get(id);
      
      if (!alert) {
        reply.code(404).send({
          success: false,
          error: 'Alert not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      reply.send({
        success: true,
        data: alert,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get alert:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve alert',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Acknowledge alert
  fastify.post('/:id/acknowledge', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const alert = alerts.get(id);
      
      if (!alert) {
        reply.code(404).send({
          success: false,
          error: 'Alert not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update alert status
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      alerts.set(id, alert);
      
      reply.send({
        success: true,
        data: alert,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to acknowledge alert:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to acknowledge alert',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
