import React, { useState, useEffect, useCallback } from 'react';
import { Satellite, RiskAlert, SpaceWeatherData } from './types';
import { Satellites } from './components/Satellites';
import { RiskPanel } from './components/RiskPanel';
import { OrbitVisualizer } from './components/OrbitVisualizer';
import { KpChart } from './components/KpChart';
import { fetchSpaceWeather, loadConjunctions } from './logic/data';
import { attachEventsToSatellites, createSpaceWeatherAlerts } from './logic/risk';

/**
 * Main App component for satellite monitoring
 * 
 * Manages satellites, alerts, and data loading.
 */
export default function App() {
  // State for satellites, alerts, and UI
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [kpData, setKpData] = useState<SpaceWeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'satellites' | 'risks' | 'visualization'>('satellites');

  // Generate unique ID for satellites
  const generateId = () => `sat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Event handlers

  // Add satellite to tracking
  const handleAddSatellite = useCallback((satelliteData: Omit<Satellite, 'id'>) => {
    const newSatellite: Satellite = {
      ...satelliteData,
      id: generateId()
    };
    setSatellites(prev => [...prev, newSatellite]);
  }, []);

  // Remove satellite from tracking
  const handleRemoveSatellite = useCallback((id: string) => {
    setSatellites(prev => prev.filter(sat => sat.id !== id));
  }, []);

  // Mark alert as executed
  const handleAcknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  // Load data and create alerts
  const loadData = useCallback(async () => {
    if (satellites.length === 0) {
      setAlerts([]);
      return;
    }

    setIsLoading(true);
    try {
      const [spaceWeather, conjunctions] = await Promise.all([
        fetchSpaceWeather(),
        loadConjunctions()
      ]);

      setKpData(spaceWeather);

      const conjunctionAlerts = attachEventsToSatellites(satellites, conjunctions);
      const spaceWeatherAlerts = createSpaceWeatherAlerts(satellites, spaceWeather);
      
      setAlerts([...conjunctionAlerts, ...spaceWeatherAlerts]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [satellites]);

  // Auto-refresh data every 60 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Load data when satellites change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Main UI

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* ===== APPLICATION HEADER ===== */}
      {/* Displays the application title and description */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
          🛰️ EyeWitness
        </h1>
        <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
          Monitor satellite conjunctions and space weather risks
        </p>
      </header>

      {/* ===== NAVIGATION TABS ===== */}
      {/* Tab-based navigation for different application sections */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { id: 'satellites', label: 'Satellites', icon: '🛰️' },
            { id: 'risks', label: 'Risk Alerts', icon: '⚠️' },
            { id: 'visualization', label: 'Visualization', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '15px 20px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#3498db' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                borderBottom: activeTab === tab.id ? '3px solid #2980b9' : '3px solid transparent'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ===== MAIN CONTENT AREA ===== */}
      {/* Tab-based content switching based on activeTab state */}
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ===== SATELLITES TAB ===== */}
        {/* Satellite management interface for adding and tracking satellites */}
        {activeTab === 'satellites' && (
          <Satellites 
            satellites={satellites}
            onAddSatellite={handleAddSatellite}
            onRemoveSatellite={handleRemoveSatellite}
          />
        )}

        {/* ===== RISK ALERTS TAB ===== */}
        {/* Risk assessment and alert management interface */}
        {activeTab === 'risks' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: '0', color: '#333' }}>Risk Alerts</h2>
              <button
                onClick={loadData}
                disabled={isLoading}
                style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
            <RiskPanel 
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          </div>
        )}

        {/* ===== VISUALIZATION TAB ===== */}
        {/* 3D and 2D visualizations of satellite data and space weather */}
        {activeTab === 'visualization' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Advanced Orbital Visualization</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Interactive 3D visualization with realistic orbital mechanics, Earth texture, and animated satellite orbits.
              </p>
              <OrbitVisualizer satellites={satellites} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Space Weather Activity</h3>
              <KpChart kpData={kpData} />
            </div>
          </div>
        )}
      </main>

      {/* ===== APPLICATION FOOTER ===== */}
      {/* Footer with application description and branding */}
      <footer style={{
        backgroundColor: '#34495e',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <p style={{ margin: '0', fontSize: '14px', opacity: 0.8 }}>
          Satellite monitoring system for orbital risk assessment
        </p>
      </footer>
    </div>
  );
}