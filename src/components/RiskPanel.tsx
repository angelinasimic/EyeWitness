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
 * This component displays risk alerts in a user-friendly format with:
 * - Color-coded severity levels
 * - Clear action buttons
 * - Grouped display by satellite
 * - Status tracking (executed vs pending)
 * 
 * The component helps operators quickly identify and respond to
 * satellite collision risks and space weather threats.
 */
export function RiskPanel({ alerts, onAcknowledgeAlert }: RiskPanelProps) {
  // ===== UTILITY FUNCTIONS =====
  
  /**
   * Get color for severity level
   * 
   * Maps risk severity levels to appropriate colors for visual distinction:
   * - High: Red (immediate attention required)
   * - Medium: Orange (monitor closely)
   * - Low: Blue (routine monitoring)
   * 
   * @param severity - Risk severity level
   * @returns CSS color string
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  /**
   * Get icon for severity level
   * 
   * Maps risk severity levels to emoji icons for quick visual identification:
   * - High: Red circle (🔴)
   * - Medium: Yellow circle (🟡)
   * - Low: Blue circle (🔵)
   * 
   * @param severity - Risk severity level
   * @returns Emoji icon string
   */
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🔵';
      default: return '⚪';
    }
  };

  // ===== DATA PROCESSING =====
  
  /**
   * Group alerts by satellite for organized display
   * 
   * This function organizes alerts by satellite name to make it easier
   * for operators to see all risks associated with each satellite.
   * Space weather alerts are grouped under "General" since they affect all satellites.
   * 
   * @returns Object with satellite names as keys and alert arrays as values
   */
  const groupedAlerts = alerts.reduce((groups, alert) => {
    const key = alert.satellite || 'General';
    if (!groups[key]) groups[key] = [];
    groups[key].push(alert);
    return groups;
  }, {} as Record<string, RiskAlert[]>);

  // ===== RENDER CONDITIONS =====
  
  /**
   * Display "no alerts" message when there are no risk alerts
   * 
   * This provides a clear indication that the system is operating normally
   * and there are no immediate threats to satellite operations.
   */
  if (alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <h3>No Risk Alerts</h3>
        <p>All systems operating normally</p>
      </div>
    );
  }

  // ===== RENDER =====
  // Main risk alerts display interface

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Risk Alerts ({alerts.length})</h2>
      
      {/* ===== ALERTS BY SATELLITE ===== */}
      {/* Display alerts grouped by satellite for organized viewing */}
      {Object.entries(groupedAlerts).map(([satellite, satelliteAlerts]) => (
        <div key={satellite} style={{ 
          marginBottom: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {/* ===== SATELLITE HEADER ===== */}
          {/* Shows which satellite the alerts are for with alert count */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px 15px', 
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold'
          }}>
            {satellite} ({satelliteAlerts.length} alerts)
          </div>
          
          {/* ===== ALERT CARDS ===== */}
          {/* Individual alert cards with severity, message, and action button */}
          {satelliteAlerts.map(alert => (
            <div key={alert.id} style={{ 
              padding: '15px',
              borderBottom: '1px solid #eee',
              backgroundColor: alert.acknowledged ? '#f8f9fa' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {/* ===== ALERT HEADER ===== */}
                  {/* Severity icon, level, type, and execution status */}
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
                        fontSize: '10px'
                      }}>
                        EXECUTED
                      </span>
                    )}
                  </div>
                  
                  {/* ===== ALERT MESSAGE ===== */}
                  {/* Main alert description */}
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                    {alert.message}
                  </div>
                  
                  {/* ===== SUGGESTED ACTION ===== */}
                  {/* Recommended action for operators */}
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    padding: '8px',
                    borderRadius: '3px',
                    marginBottom: '8px'
                  }}>
                    <strong>Suggested Action:</strong> {alert.suggestedAction}
                  </div>
                  
                  {/* ===== TIMESTAMP ===== */}
                  {/* When the alert was generated */}
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                
                {/* ===== ACTION BUTTON ===== */}
                {/* Execute action button or executed status */}
                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    style={{
                      backgroundColor: '#27ae60',
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
                  <div style={{
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Executed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}