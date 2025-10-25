import React, { useState, useEffect } from 'react';
import { Satellite, SatelliteOption } from '../types';
import { loadSatelliteOptions } from '../logic/data';

/**
 * Props interface for the Satellites component
 */
interface SatellitesProps {
  /** Array of currently tracked satellites */
  satellites: Satellite[];
  /** Callback function to add a new satellite */
  onAddSatellite: (satellite: Omit<Satellite, 'id'>) => void;
  /** Callback function to remove a satellite by ID */
  onRemoveSatellite: (id: string) => void;
}

/**
 * Satellite management component with dropdown and manual entry
 * 
 * This component provides two ways to add satellites:
 * 1. Dropdown selection from pre-defined satellite options
 * 2. Manual entry with custom orbital parameters
 * 
 * It also displays a list of currently tracked satellites with delete functionality.
 */
export function Satellites({ satellites, onAddSatellite, onRemoveSatellite }: SatellitesProps) {
  // ===== STATE MANAGEMENT =====
  
  /** Pre-defined satellite options loaded from JSON file */
  const [options, setOptions] = useState<SatelliteOption[]>([]);
  
  /** Currently selected satellite from dropdown */
  const [selectedOption, setSelectedOption] = useState('');
  
  /** Manual entry form data */
  const [manualEntry, setManualEntry] = useState({
    name: '',
    altitudeKm: '',
    inclinationDeg: '',
    raanDeg: ''
  });

  // ===== EFFECT HOOKS =====
  
  /**
   * Load satellite options when component mounts
   * 
   * This effect fetches the pre-defined satellite options from the JSON file.
   * If loading fails, it provides fallback options to ensure the app still works.
   */
  useEffect(() => {
    loadSatelliteOptions()
      .then(setOptions)
      .catch(error => {
        console.error('Failed to load satellite options:', error);
        // Set some default options if loading fails
        setOptions([
          { name: "ISS (ZARYA)", altitudeKm: 410, inclinationDeg: 51.6, raanDeg: 0 },
          { name: "HUBBLE", altitudeKm: 540, inclinationDeg: 28.5, raanDeg: 30 }
        ]);
      });
  }, []);

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle adding a satellite from the dropdown list
   * 
   * Finds the selected option and adds it to the satellite list.
   * Clears the selection after adding.
   */
  const handleAddFromList = () => {
    const option = options.find(opt => opt.name === selectedOption);
    if (option) {
      onAddSatellite(option);
      setSelectedOption('');
    }
  };

  /**
   * Handle adding a satellite from manual entry
   * 
   * Validates that all fields are filled, converts strings to numbers,
   * and adds the satellite to the list. Clears the form after adding.
   */
  const handleAddManual = () => {
    if (manualEntry.name && manualEntry.altitudeKm && manualEntry.inclinationDeg && manualEntry.raanDeg) {
      onAddSatellite({
        name: manualEntry.name,
        altitudeKm: Number(manualEntry.altitudeKm),
        inclinationDeg: Number(manualEntry.inclinationDeg),
        raanDeg: Number(manualEntry.raanDeg)
      });
      setManualEntry({ name: '', altitudeKm: '', inclinationDeg: '', raanDeg: '' });
    }
  };

  // ===== RENDER =====
  // Main satellite management interface

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Satellite Management</h2>
      
      {/* ===== ADD FROM LIST SECTION ===== */}
      {/* Dropdown to select from pre-defined satellite options */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Add from List</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={selectedOption} 
            onChange={(e) => setSelectedOption(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          >
            <option value="">Select satellite...</option>
            {options.map(opt => (
              <option key={opt.name} value={opt.name}>{opt.name}</option>
            ))}
          </select>
          <button onClick={handleAddFromList} disabled={!selectedOption}>
            Add
          </button>
        </div>
      </div>

      {/* ===== MANUAL ENTRY SECTION ===== */}
      {/* Form for manually entering satellite orbital parameters */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Manual Entry</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input
            placeholder="Name"
            value={manualEntry.name}
            onChange={(e) => setManualEntry({...manualEntry, name: e.target.value})}
            style={{ padding: '8px' }}
          />
          <input
            placeholder="Altitude (km)"
            type="number"
            value={manualEntry.altitudeKm}
            onChange={(e) => setManualEntry({...manualEntry, altitudeKm: e.target.value})}
            style={{ padding: '8px' }}
          />
          <input
            placeholder="Inclination (deg)"
            type="number"
            value={manualEntry.inclinationDeg}
            onChange={(e) => setManualEntry({...manualEntry, inclinationDeg: e.target.value})}
            style={{ padding: '8px' }}
          />
          <input
            placeholder="RAAN (deg)"
            type="number"
            value={manualEntry.raanDeg}
            onChange={(e) => setManualEntry({...manualEntry, raanDeg: e.target.value})}
            style={{ padding: '8px' }}
          />
        </div>
        <button 
          onClick={handleAddManual} 
          disabled={!manualEntry.name || !manualEntry.altitudeKm || !manualEntry.inclinationDeg || !manualEntry.raanDeg}
          style={{ marginTop: '10px' }}
        >
          Add Manual
        </button>
      </div>

      {/* ===== SATELLITE LIST SECTION ===== */}
      {/* Display of currently tracked satellites with delete functionality */}
      <div>
        <h3>Tracked Satellites ({satellites.length})</h3>
        {satellites.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No satellites tracked</p>
        ) : (
          <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            {satellites.map(sat => (
              <div key={sat.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <strong>{sat.name}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Alt: {sat.altitudeKm}km, Inc: {sat.inclinationDeg}°, RAAN: {sat.raanDeg}°
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveSatellite(sat.id)}
                  style={{ 
                    backgroundColor: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    padding: '5px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
