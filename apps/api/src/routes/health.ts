import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { config } from '../config';
import { logger } from '../utils/logger';

export async function healthRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {
  // Health check endpoint
  fastify.get('/', async (request, reply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: config.NODE_ENV,
        services: {
          donki: !!config.NASA_API_KEY,
          spacetrack: !!(config.SPACETRACK_USER && config.SPACETRACK_PASS),
          celestrak: true, // Always available
          swpc: true, // Always available
        },
      };

      reply.send(health);
    } catch (error) {
      logger.error('Health check failed:', error);
      reply.code(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Detailed health check
  fastify.get('/detailed', async (request, reply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: config.NODE_ENV,
        services: {
          donki: {
            available: !!config.NASA_API_KEY,
            baseUrl: 'https://api.nasa.gov/DONKI',
          },
          spacetrack: {
            available: !!(config.SPACETRACK_USER && config.SPACETRACK_PASS),
            baseUrl: 'https://www.space-track.org',
          },
          celestrak: {
            available: true,
            baseUrl: config.CELESTRAK_BASE,
          },
          swpc: {
            available: true,
            baseUrl: config.SWPC_BASE,
          },
        },
        configuration: {
          demo: config.DEMO,
          jwtSecret: !!config.JWT_SECRET,
        },
      };

      reply.send(health);
    } catch (error) {
      logger.error('Detailed health check failed:', error);
      reply.code(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
