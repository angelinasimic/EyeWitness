import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SatelliteInputSchema, SatelliteSchema } from '@eyewitness/core';
import { CelestrakClient } from '../adapters/celestrak-client';
import { SGP4Propagator, createPropagator } from '@eyewitness/sgp4';
import { logger } from '../utils/logger';

// In-memory storage for demo purposes
const satellites = new Map<string, any>();

export async function satelliteRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {
  const celestrakClient = new CelestrakClient();

  // Add satellite
  fastify.post('/', async (request, reply) => {
    try {
      const input = SatelliteInputSchema.parse(request.body);
      
      // Generate ID
      const id = `sat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // If NORAD ID is provided, try to fetch TLE data
      let tleData = input.tle;
      let ommData = input.omm;
      
      if (input.noradId && !tleData && !ommData) {
        try {
          const satelliteData = await celestrakClient.getSatelliteData(input.noradId);
          if (satelliteData) {
            ommData = satelliteData;
          }
        } catch (error) {
          logger.warn(`Failed to fetch data for NORAD ID ${input.noradId}:`, error);
        }
      }

      // Create satellite object
      const satellite: any = {
        id,
        name: input.name,
        noradId: input.noradId,
        tle: tleData,
        omm: ommData,
        lastUpdated: new Date().toISOString(),
      };

      // If TLE is available, try to propagate and get position
      if (tleData) {
        try {
          const tleLines = tleData.trim().split('\n');
          if (tleLines.length >= 2) {
            const propagator = createPropagator(tleLines[0], tleLines[1]);
            const result = propagator.propagate(new Date());
            
            satellite.position = {
              x: result.position.x,
              y: result.position.y,
              z: result.position.z,
            };
            satellite.velocity = {
              x: result.velocity.x,
              y: result.velocity.y,
              z: result.velocity.z,
            };
          }
        } catch (error) {
          logger.warn(`Failed to propagate satellite ${id}:`, error);
        }
      }

      satellites.set(id, satellite);
      
      reply.code(201).send({
        success: true,
        data: satellite,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to add satellite:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid satellite data',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get all satellites
  fastify.get('/', async (request, reply) => {
    try {
      const satelliteList = Array.from(satellites.values());
      
      reply.send({
        success: true,
        data: satelliteList,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get satellites:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve satellites',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get specific satellite
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const satellite = satellites.get(id);
      
      if (!satellite) {
        reply.code(404).send({
          success: false,
          error: 'Satellite not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      reply.send({
        success: true,
        data: satellite,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get satellite:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve satellite',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Update satellite
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const input = SatelliteInputSchema.parse(request.body);
      
      const existingSatellite = satellites.get(id);
      if (!existingSatellite) {
        reply.code(404).send({
          success: false,
          error: 'Satellite not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update satellite
      const updatedSatellite = {
        ...existingSatellite,
        name: input.name,
        noradId: input.noradId,
        tle: input.tle,
        omm: input.omm,
        lastUpdated: new Date().toISOString(),
      };

      // Re-propagate if TLE changed
      if (input.tle && input.tle !== existingSatellite.tle) {
        try {
          const tleLines = input.tle.trim().split('\n');
          if (tleLines.length >= 2) {
            const propagator = createPropagator(tleLines[0], tleLines[1]);
            const result = propagator.propagate(new Date());
            
            updatedSatellite.position = {
              x: result.position.x,
              y: result.position.y,
              z: result.position.z,
            };
            updatedSatellite.velocity = {
              x: result.velocity.x,
              y: result.velocity.y,
              z: result.velocity.z,
            };
          }
        } catch (error) {
          logger.warn(`Failed to propagate updated satellite ${id}:`, error);
        }
      }

      satellites.set(id, updatedSatellite);
      
      reply.send({
        success: true,
        data: updatedSatellite,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to update satellite:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid satellite data',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Delete satellite
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      if (!satellites.has(id)) {
        reply.code(404).send({
          success: false,
          error: 'Satellite not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      satellites.delete(id);
      
      reply.send({
        success: true,
        data: { message: 'Satellite deleted successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to delete satellite:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to delete satellite',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
