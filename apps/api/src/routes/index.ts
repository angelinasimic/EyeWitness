import { FastifyInstance } from 'fastify';
import { WebSocketManager } from '../websocket/manager';
import { PollingService } from '../services/polling';
import { DecisionEngine } from '../services/decision-engine';
import { satelliteRoutes } from './satellites';
import { alertRoutes } from './alerts';
import { spaceWeatherRoutes } from './space-weather';
import { decisionRoutes } from './decisions';
import { healthRoutes } from './health';

export async function registerRoutes(
  fastify: FastifyInstance,
  services: {
    wsManager: WebSocketManager;
    pollingService: PollingService;
    decisionEngine: DecisionEngine;
  }
): Promise<void> {
  // Initialize WebSocket manager
  console.log('Initializing WebSocket manager...');
  await services.wsManager.initialize();
  console.log('WebSocket manager initialized');

  // Register route modules
  await fastify.register(satelliteRoutes, { prefix: '/satellites' });
  await fastify.register(alertRoutes, { prefix: '/alerts' });
  await fastify.register(spaceWeatherRoutes, { prefix: '/space-weather' });
  await fastify.register(decisionRoutes, { prefix: '/decisions' });
  await fastify.register(healthRoutes, { prefix: '/healthz' });

  // Add metrics endpoint
  fastify.get('/metrics', async (request, reply) => {
    const metrics = {
      websocket_connections: services.wsManager.getConnectionCount(),
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    reply.type('application/json').send(metrics);
  });
}
