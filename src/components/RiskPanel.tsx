import React from 'react';
import { RiskAlert } from '../types';

/**
 * Props interface for the RiskPanel component
 */
interface RiskPanelProps {
  /** Array of risk alerts to display */
  alerts: RiskAlert[];
  /** Callback function to execute an alert action */
  onAcknowledgeAlert: (id: string) => void;
}

/**
 * Risk panel component for displaying and managing risk alerts
 * 
 * Displays risk alerts in a user-friendly format with:
 * - Color-coded severity levels
 * - Clear action buttons
 * - Grouped display by satellite
 * - Status tracking (executed vs pending)
 */
export function RiskPanel({ alerts, onAcknowledgeAlert }: RiskPanelProps) {
  // Get color for severity level
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  // Get icon for severity level
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🔵';
      default: return '⚪';
    }
  };

  // Group alerts by satellite
  const groupedAlerts = alerts.reduce((groups, alert) => {
    const key = alert.satellite || 'General';
    if (!groups[key]) groups[key] = [];
    groups[key].push(alert);
    return groups;
  }, {} as Record<string, RiskAlert[]>);

  // Show "no alerts" message if no alerts
  if (alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <h3>No Risk Alerts</h3>
        <p>All systems operating normally</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Risk Alerts ({alerts.length})</h2>
      
      {/* Display alerts grouped by satellite */}
      {Object.entries(groupedAlerts).map(([satellite, satelliteAlerts]) => (
        <div key={satellite} style={{ 
          marginBottom: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {/* Satellite header */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px 15px', 
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold'
          }}>
            {satellite} ({satelliteAlerts.length} alerts)
          </div>
          
          {/* Alert cards */}
          {satelliteAlerts.map(alert => (
            <div key={alert.id} style={{ 
              padding: '15px',
              borderBottom: '1px solid #eee',
              backgroundColor: alert.acknowledged ? '#f8f9fa' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {/* Alert header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>
                      {getSeverityIcon(alert.severity)}
                    </span>
                    <span style={{ 
                      color: getSeverityColor(alert.severity),
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      fontSize: '12px'
                    }}>
                      {alert.severity} {alert.type.toUpperCase()}
                    </span>
                    {alert.acknowledged && (
                      <span style={{ 
                        backgroundColor: '#27ae60', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        EXECUTED
                      </span>
                    )}
                  </div>
                  
                  {/* Alert message */}
                  <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    {alert.message}
                  </div>
                  
                  {/* Suggested action */}
                  <div style={{ 
                    backgroundColor: '#ecf0f1', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    marginBottom: '10px'
                  }}>
                    <strong>Suggested Action:</strong> {alert.suggestedAction}
                  </div>
                  
                  {/* Timestamp */}
                  <div style={{ fontSize: '11px', color: '#7f8c8d' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                
                {/* Action button */}
                <div style={{ marginLeft: '15px' }}>
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Execute Action
                    </button>
                  ) : (
                    <span style={{ 
                      backgroundColor: '#27ae60', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      Executed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}