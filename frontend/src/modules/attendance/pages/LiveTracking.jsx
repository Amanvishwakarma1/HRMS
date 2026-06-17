import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent.jsx';
import { geofenceService } from '../services/geofenceService.js';

export const LiveTracking = () => {
  const [employeeLocations, setEmployeeLocations] = useState([]);
  const [officeConfig, setOfficeConfig] = useState(null);

  const fetchStreamData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/live-tracking');
      if (res.data.success && res.data.data) {
        setEmployeeLocations(res.data.data);
      }
    } catch (err) {
      console.error("❌ Live Tracking Link Connection lost:", err);
    }
  };

  useEffect(() => {
    // Load the real geofence config from the database
    geofenceService.fetchOfficeLocation().then(config => {
      setOfficeConfig(config);
    });

    fetchStreamData();
    const syncInterval = setInterval(fetchStreamData, 4000);
    return () => clearInterval(syncInterval);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Dynamic Header Block */}
      <div style={{
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '20px',
        border: '1px solid #e5e4e7'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#08060d', fontSize: '20px', fontWeight: 'bold' }}>
            📍 Live Fleet Telemetry Matrix
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b6375' }}>
            Monitoring active workforce allocations globally
          </p>
        </div>
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ● Active Operators Connected: {employeeLocations.length}
        </div>
      </div>

      {/* Map display box. Fits into standard layout structure cleanly */}
      <div style={{ 
        height: '600px', 
        width: '100%', 
        borderRadius: '12px', 
        overflow: 'hidden',
        border: '1px solid #e5e4e7'
      }}>
        <MapComponent locations={employeeLocations} officeConfig={officeConfig} />
      </div>
    </div>
  );
};

export default LiveTracking;