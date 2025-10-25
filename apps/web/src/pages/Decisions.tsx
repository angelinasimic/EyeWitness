import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Play, Check, X, Clock } from 'lucide-react';
import { api } from '../services/api';

export function Decisions() {
  const queryClient = useQueryClient();

  const { data: decisions, isLoading } = useQuery({
    queryKey: ['decisions'],
    queryFn: api.getDecisions,
  });

  const executeMutation = useMutation({
    mutationFn: ({ decisionId, actionId }: { decisionId: string; actionId: string }) =>
      api.executeDecision(decisionId, actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'text-green-400 bg-green-900/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'rejected':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executed':
        return <Check className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-space-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Decisions</h1>
        <div className="text-sm text-gray-400">
          {decisions?.length || 0} decisions
        </div>
      </div>

      <div className="grid gap-4">
        {decisions?.map((decision: any) => (
          <div key={decision.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-space-400 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-white">
                      Decision for {decision.alertType} alert
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(decision.status)}`}>
                      {getStatusIcon(decision.status)}
                      <span>{decision.status}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Created: {new Date(decision.createdAt).toLocaleString()}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Suggested Actions:</h4>
                    {decision.suggestedActions.map((action: any) => (
                      <div key={action.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">{action.type}</span>
                              {action.deltaV_mps && (
                                <span className="text-sm text-space-400">
                                  ΔV: {action.deltaV_mps.toFixed(2)} m/s
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{action.rationale}</p>
                            {action.direction && (
                              <p className="text-sm text-gray-500 mt-1">{action.direction}</p>
                            )}
                          </div>
                          {decision.status === 'pending' && (
                            <button
                              onClick={() => executeMutation.mutate({ 
                                decisionId: decision.id, 
                                actionId: action.id 
                              })}
                              className="btn btn-primary flex items-center space-x-1"
                              disabled={executeMutation.isPending}
                            >
                              <Play className="h-4 w-4" />
                              <span>Execute</span>
                            </button>
                          )}
                        </div>
                        {action.window_start && action.window_end && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Window: {new Date(action.window_start).toLocaleString()} - {new Date(action.window_end).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {decision.executionLog && (
                    <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                      <h5 className="font-medium text-white mb-1">Execution Log:</h5>
                      <p className="text-sm text-gray-400">{decision.executionLog}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Executed: {new Date(decision.executedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {decisions?.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No decisions available</h3>
          <p className="text-gray-500">Decisions will appear here when alerts are analyzed.</p>
        </div>
      )}
    </div>
  );
}
