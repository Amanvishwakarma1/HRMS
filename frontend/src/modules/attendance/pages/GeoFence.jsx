import React, { useState } from 'react';
import { MapPin, ShieldAlert, ShieldCheck, Compass, Info } from 'lucide-react';

const GeoFence = () => {
  const locations = {
    OfficeDesk: { name: 'Office Desk', lat: 12.97161, lng: 77.59461, distance: 12, inside: true },
    OfficeEntrance: { name: 'Office Entrance', lat: 12.97210, lng: 77.59490, distance: 95, inside: true },
    NearbyCafe: { name: 'Nearby Cafe', lat: 12.97450, lng: 77.59750, distance: 340, inside: false },
    HomeRemote: { name: 'Home / Remote', lat: 13.05240, lng: 77.63210, distance: 12400, inside: false }
  };

  const [simulationMode, setSimulationMode] = useState(() => {
    return localStorage.getItem('hrms_simulated_location_mode') || 'OfficeDesk';
  });

  React.useEffect(() => {
    // Seed initial coordinates if not present
    if (!localStorage.getItem('hrms_simulated_gps_coords')) {
      localStorage.setItem('hrms_simulated_gps_coords', JSON.stringify(locations.OfficeDesk));
    }
  }, []);

  const handleSimulate = (key) => {
    setSimulationMode(key);
    localStorage.setItem('hrms_simulated_location_mode', key);
    localStorage.setItem('hrms_simulated_gps_coords', JSON.stringify(locations[key]));
  };

  const activeLoc = locations[simulationMode];
  const officeLat = 12.97160;
  const officeLng = 77.59460;
  const fenceRadius = 200; // meters

  // Map employee position to SVG space
  // SVG center is (150, 150) - representing the office
  let empX = 150;
  let empY = 150;
  if (simulationMode === 'OfficeDesk') {
    empX = 145; empY = 145;
  } else if (simulationMode === 'OfficeEntrance') {
    empX = 175; empY = 110;
  } else if (simulationMode === 'NearbyCafe') {
    empX = 230; empY = 60;
  } else if (simulationMode === 'HomeRemote') {
    empX = 280; empY = 30;
  }

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '24px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px'
    },
    title: {
      margin: '0 0 16px 0',
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statusBox: (inside) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: inside ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${inside ? '#bbf7d0' : '#fecaca'}`,
      color: inside ? '#166534' : '#991b1b',
      marginBottom: '20px'
    }),
    coordRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    label: { color: '#64748b' },
    value: { color: '#334155', fontWeight: 'bold' },
    simBtn: (isActive) => ({
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      backgroundColor: isActive ? '#0ea5e9' : '#fff',
      color: isActive ? '#fff' : '#475569',
      fontWeight: '600',
      fontSize: '13px',
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s'
    })
  };

  return (
    <div style={styles.grid}>
      {/* Left: Map Visualization */}
      <div style={styles.card}>
        <h3 style={styles.title}>
          <Compass size={20} color="#0ea5e9" />
          Live Geofence Map Visualizer
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', position: 'relative' }}>
          {/* SVG Map */}
          <svg width="300" height="300" style={{ background: '#e2e8f0', borderRadius: '50%' }}>
            {/* Grid Lines */}
            <line x1="0" y1="150" x2="300" y2="150" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="150" y1="0" x2="150" y2="300" stroke="#cbd5e1" strokeDasharray="3 3" />
            
            {/* Geofence Perimeter */}
            <circle cx="150" cy="150" r="80" fill="rgba(34, 197, 94, 0.08)" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="150" cy="150" r="4" fill="#22c55e" />
            
            {/* Office Center Marker */}
            <rect x="142" y="136" width="16" height="16" rx="3" fill="#0ea5e9" />
            <circle cx="150" cy="144" r="3" fill="#fff" />
            
            {/* Dotted Connection line */}
            <line x1="150" y1="150" x2={empX} y2={empY} stroke={activeLoc.inside ? '#22c55e' : '#ef4444'} strokeWidth="1.5" strokeDasharray="2 2" />
            
            {/* Employee Pinging Dot */}
            <g>
              <circle cx={empX} cy={empY} r="10" fill={activeLoc.inside ? 'rgba(14, 165, 233, 0.2)' : 'rgba(239, 68, 68, 0.2)'}>
                <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={empX} cy={empY} r="5" fill={activeLoc.inside ? '#0ea5e9' : '#ef4444'} />
            </g>
          </svg>

          {/* Scale Legend */}
          <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#64748b', border: '1px solid #cbd5e1' }}>
            Scale Circle: 200m
          </div>
        </div>
      </div>

      {/* Right: Controls & Details */}
      <div style={styles.card}>
        <h3 style={styles.title}>
          <MapPin size={20} color="#0ea5e9" />
          Coordinates & Authorization
        </h3>

        <div style={styles.statusBox(activeLoc.inside)}>
          {activeLoc.inside ? (
            <>
              <ShieldCheck size={28} />
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Check-In Allowed</strong>
                <span style={{ fontSize: '12px' }}>You are inside the authorized geofence radius.</span>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert size={28} />
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Check-In Restricted</strong>
                <span style={{ fontSize: '12px' }}>You are outside the authorized geofence radius.</span>
              </div>
            </>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={styles.coordRow}>
            <span style={styles.label}>Office Coordinates</span>
            <span style={styles.value}>{officeLat.toFixed(5)} N, {officeLng.toFixed(5)} E</span>
          </div>
          <div style={styles.coordRow}>
            <span style={styles.label}>Employee Coordinates</span>
            <span style={styles.value}>{activeLoc.lat.toFixed(5)} N, {activeLoc.lng.toFixed(5)} E</span>
          </div>
          <div style={styles.coordRow}>
            <span style={styles.label}>Calculated Distance</span>
            <span style={{ ...styles.value, color: activeLoc.inside ? '#22c55e' : '#ef4444' }}>
              {activeLoc.distance >= 1000 ? `${(activeLoc.distance / 1000).toFixed(2)} km` : `${activeLoc.distance} meters`}
            </span>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#1e293b' }}>Simulate Employee Location:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(locations).map((key) => (
              <button
                key={key}
                style={styles.simBtn(simulationMode === key)}
                onClick={() => setSimulationMode(key)}
              >
                <span>{locations[key].name}</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>
                  {locations[key].distance >= 1000 ? `${(locations[key].distance / 1000).toFixed(1)} km` : `${locations[key].distance}m`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoFence;
