import { FastifyInstance } from 'fastify';
import { WebSocketMessage } from '@space-sa/core';
import { logger } from '../utils/logger';

export class WebSocketManager {
  private fastify: FastifyInstance;
  private connections: Set<any> = new Set();

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async initialize(): Promise<void> {
    const self = this;
    this.fastify.register(async function (fastify) {
      fastify.get('/ws', { websocket: true }, (connection, req) => {
        logger.info('New WebSocket connection established');
        self.connections.add(connection);

        connection.socket.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());
            logger.debug('Received WebSocket message:', data);
            // Handle incoming messages if needed
          } catch (error) {
            logger.error('Failed to parse WebSocket message:', error);
          }
        });

        connection.socket.on('close', () => {
          logger.info('WebSocket connection closed');
          self.connections.delete(connection);
        });

        connection.socket.on('error', (error) => {
          logger.error('WebSocket error:', error);
          self.connections.delete(connection);
        });

        // Send welcome message
        connection.socket.send(JSON.stringify({
          type: 'connection',
          data: { message: 'Connected to Space Situational Awareness System' },
          timestamp: new Date().toISOString(),
        }));
      });
    });
  }

  broadcast(message: WebSocketMessage): void {
    if (this.connections.size === 0) {
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    this.connections.forEach((connection) => {
      try {
        if (connection.socket.readyState === 1) { // WebSocket.OPEN
          connection.socket.send(messageStr);
          sentCount++;
        } else {
          // Remove closed connections
          this.connections.delete(connection);
        }
      } catch (error) {
        logger.error('Failed to send WebSocket message:', error);
        this.connections.delete(connection);
      }
    });

    logger.debug(`Broadcasted message to ${sentCount} connections`, { message });
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  closeAllConnections(): void {
    this.connections.forEach((connection) => {
      try {
        connection.socket.close();
      } catch (error) {
        logger.error('Failed to close WebSocket connection:', error);
      }
    });
    this.connections.clear();
  }
}
