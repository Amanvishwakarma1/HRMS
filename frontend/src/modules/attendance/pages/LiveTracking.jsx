import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import { useAttendance } from '../hooks/useAttendance';

const LiveTracking = () => {
  const { officeConfig } = useAttendance();
  const [fleetLocations, setFleetLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = () => {
      setLoading(true);
      axios.get('http://localhost:5000/api/attendance/live-tracking')
        .then(res => {
          if (res.data && res.data.success) {
            const mapped = res.data.data.map(emp => ({
              id: emp.id,
              name: emp.name,
              role: emp.role,
              latitude: emp.latitude,
              longitude: emp.longitude,
              status: emp.status,
              geofence_verified: emp.geofence_verified
            }));
            setFleetLocations(mapped);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading fleet telemetry:", err);
          setLoading(false);
        });
    };

    fetchFleet();
    const interval = setInterval(fetchFleet, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-fadeIn">
      {/* Telemetry Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-100">Live Fleet Telemetry Matrix</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Monitoring active workforce allocations globally.</p>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-[10px] font-bold text-emerald-400 font-mono">Active Operators: {fleetLocations.length}</span>
        </div>
      </div>

      {/* Tracking Map viewport */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-3 shadow-inner h-[550px]">
        {loading && fleetLocations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400 uppercase font-mono tracking-widest animate-pulse">
            Querying GPS Telemetry Grid...
          </div>
        ) : (
          <MapComponent locations={fleetLocations} officeConfig={officeConfig} />
        )}
      </div>
    </div>
  );
};

export default LiveTracking;