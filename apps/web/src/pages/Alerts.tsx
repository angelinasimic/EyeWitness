import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Filter, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export function Alerts() {
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => api.getAlerts(filters),
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-400 bg-red-900/20';
      case 'High':
        return 'text-orange-400 bg-orange-900/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'Low':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conjunction':
        return '🛰️';
      case 'space_weather':
        return '☀️';
      default:
        return '⚠️';
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
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="select"
            >
              <option value="">All Types</option>
              <option value="conjunction">Conjunction</option>
              <option value="space_weather">Space Weather</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="select"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts?.map((alert: any) => (
          <div key={alert.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">{alert.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Source: {alert.source}</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {alert.link && (
                <a
                  href={alert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-space-400 hover:text-space-300"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Source</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts?.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No alerts found</h3>
          <p className="text-gray-500">No alerts match your current filters.</p>
        </div>
      )}
    </div>
  );
}
