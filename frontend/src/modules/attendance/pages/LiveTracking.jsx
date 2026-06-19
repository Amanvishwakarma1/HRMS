import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import { useAttendance } from '../hooks/useAttendance';
import { Search, MapPin, RefreshCw, Clock } from 'lucide-react';

const LiveTracking = () => {
  const { officeConfig } = useAttendance();
  const [fleetLocations, setFleetLocations] = useState([]);
  const [filteredFleet, setFilteredFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'User', role: 'employee' };
  const isEmployee = storedUser.role === 'employee';
  const token = localStorage.getItem('token') || '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchFleet = () => {
    setLoading(true);
    axios.get('/api/attendance/live-tracking', { headers })
      .then(res => {
        if (res.data && res.data.success) {
          const mapped = res.data.data.map(emp => ({
            id: emp.id,
            name: emp.name,
            role: emp.role,
            latitude: emp.latitude,
            longitude: emp.longitude,
            status: emp.status,
            department: emp.department || 'Engineering', // fallback
            geofence_verified: emp.geofence_verified
          }));
          setFleetLocations(mapped);
          setLastUpdated(new Date().toLocaleTimeString());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading fleet telemetry:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Update filtered list based on search and department filters
  useEffect(() => {
    let result = fleetLocations;
    if (search.trim()) {
      result = result.filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (deptFilter) {
      result = result.filter(emp => emp.department === deptFilter);
    }
    setFilteredFleet(result);
  }, [search, deptFilter, fleetLocations]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-fadeIn">
      {/* Telemetry Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-100">
            {isEmployee ? 'My Live Location' : 'Live Fleet Telemetry Matrix'}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <Clock size={12} />
            <span>Last Updated: {lastUpdated || 'Never'}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-[10px] font-bold text-emerald-400 font-mono">
            {isEmployee ? 'Status: Active Tracking' : `Active Operators: ${filteredFleet.length}`}
          </span>
        </div>
      </div>

      {/* Filter Toolbar (HR / Manager View) */}
      {!isEmployee && (
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
            
            <button
              onClick={fetchFleet}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tracking Map viewport */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-3 shadow-inner h-[550px]">
        {loading && fleetLocations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400 uppercase font-mono tracking-widest animate-pulse">
            Querying GPS Telemetry Grid...
          </div>
        ) : (
          <MapComponent locations={filteredFleet} officeConfig={officeConfig} />
        )}
      </div>
    </div>
  );
};

export default LiveTracking;