import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { registerRoutes } from './routes';
import { WebSocketManager } from './websocket/manager';
import { PollingService } from './services/polling';
import { DecisionEngine } from './services/decision-engine';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: config.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
  disableRequestLogging: false,
});

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: true,
      credentials: true,
    });

    await fastify.register(helmet, {
      contentSecurityPolicy: false,
    });

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    await fastify.register(websocket);

    // Initialize services
    const wsManager = new WebSocketManager(fastify);
    const pollingService = new PollingService(wsManager);
    const decisionEngine = new DecisionEngine();

    // Register routes
    logger.info('Registering routes...');
    await registerRoutes(fastify, { wsManager, pollingService, decisionEngine });
    logger.info('Routes registered successfully');

    // Start polling service
    logger.info('Starting polling service...');
    await pollingService.start();

    // Start server
    const port = config.PORT || 3000;
    const host = config.HOST || '0.0.0.0';
    
    logger.info(`Starting server on ${host}:${port}...`);
    await fastify.listen({ port, host });
    
    logger.info(`Server listening on http://${host}:${port}`);
    logger.info(`WebSocket available at ws://${host}:${port}/ws`);
    
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

start();
