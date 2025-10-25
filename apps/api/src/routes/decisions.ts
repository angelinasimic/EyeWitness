import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DecisionEngine } from '../services/decision-engine';
import { ConjunctionAlertSchema, SpaceWeatherAlertSchema } from '@eyewitness/core';
import { logger } from '../utils/logger';

// In-memory storage for demo purposes
const decisions = new Map<string, any>();

export async function decisionRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {
  const decisionEngine = new DecisionEngine();

  // Get decision suggestions
  fastify.post('/suggest', async (request, reply) => {
    try {
      const { alertType, alertData } = request.body as { 
        alertType: string; 
        alertData: any; 
      };
      
      let suggestedActions: any[] = [];
      
      if (alertType === 'conjunction') {
        const conjunctionAlert = ConjunctionAlertSchema.parse(alertData);
        suggestedActions = decisionEngine.analyzeConjunction(conjunctionAlert);
      } else if (alertType === 'space_weather') {
        const spaceWeatherAlert = SpaceWeatherAlertSchema.parse(alertData);
        suggestedActions = decisionEngine.analyzeSpaceWeather(spaceWeatherAlert);
      } else {
        reply.code(400).send({
          success: false,
          error: 'Invalid alert type',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create decision record
      const decisionId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const decision = {
        id: decisionId,
        alertType,
        alertData,
        suggestedActions,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      decisions.set(decisionId, decision);
      
      reply.send({
        success: true,
        data: decision,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to generate decision suggestions:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid alert data',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Execute decision
  fastify.post('/execute', async (request, reply) => {
    try {
      const { decisionId, actionId } = request.body as { 
        decisionId: string; 
        actionId: string; 
      };
      
      const decision = decisions.get(decisionId);
      if (!decision) {
        reply.code(404).send({
          success: false,
          error: 'Decision not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const action = decision.suggestedActions.find((a: any) => a.id === actionId);
      if (!action) {
        reply.code(404).send({
          success: false,
          error: 'Action not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Mock execution - in real system, this would interface with satellite control systems
      const executionLog = `Executed ${action.type} action: ${action.rationale}`;
      
      // Update decision status
      decision.status = 'executed';
      decision.executedAt = new Date().toISOString();
      decision.executionLog = executionLog;
      decisions.set(decisionId, decision);

      logger.info('Decision executed', { decisionId, actionId, action });
      
      reply.send({
        success: true,
        data: {
          decisionId,
          actionId,
          status: 'executed',
          executionLog,
          executedAt: decision.executedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to execute decision:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to execute decision',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get all decisions
  fastify.get('/', async (request, reply) => {
    try {
      const { status, limit } = request.query as { 
        status?: string; 
        limit?: string; 
      };
      
      let decisionList = Array.from(decisions.values());
      
      // Filter by status
      if (status) {
        decisionList = decisionList.filter(decision => decision.status === status);
      }
      
      // Apply limit
      if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum)) {
          decisionList = decisionList.slice(0, limitNum);
        }
      }
      
      // Sort by creation time (newest first)
      decisionList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      reply.send({
        success: true,
        data: decisionList,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get decisions:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve decisions',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get specific decision
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const decision = decisions.get(id);
      
      if (!decision) {
        reply.code(404).send({
          success: false,
          error: 'Decision not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      reply.send({
        success: true,
        data: decision,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get decision:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve decision',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
