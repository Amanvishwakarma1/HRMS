import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAttendance } from '../hooks/useAttendance';
import { WorkHourCard } from "../components/WorkHourCard"; // Named import matching your component folder
import { CheckIn } from './CheckIn';
import { CheckOut } from './CheckOut';
import { AttendanceHistory } from './AttendanceHistory'; // Fixed duplicate import issue here
import { AttendanceCalendar } from './AttendanceCalendar';
import { AttendanceReport } from './AttendanceReport';
import { LiveTracking } from './LiveTracking';
import { ShiftManagement } from './ShiftManagement';
import { GeofenceSettings } from './GeofenceSettings';
import { MapView } from './MapView';
import { WorkSummary } from "./WorkSummary"; // Named import matching your pages folder

export const AttendanceDashboard = () => {
  // Pull core state data mutation flags from the main state monitoring hook
  const { todayRecord, loading, fetchStatus } = useAttendance();
  const [activeTab, setActiveTab] = useState('checkin');
  
  const [employees, setEmployees] = useState([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(localStorage.getItem('active_employee_id') || '2');

  useEffect(() => {
    axios.get('http://localhost:5000/api/employees')
      .then(res => {
        if (res.data && res.data.success) {
          setEmployees(res.data.data);
          const list = res.data.data;
          if (list.length > 0 && !list.some(e => String(e.id) === String(currentEmployeeId))) {
            const firstId = String(list[0].id);
            setCurrentEmployeeId(firstId);
            localStorage.setItem('active_employee_id', firstId);
          }
        }
      })
      .catch(err => console.error("Error loading employees:", err));
  }, []);

  const handleEmployeeChange = (id) => {
    setCurrentEmployeeId(id);
    localStorage.setItem('active_employee_id', id);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('attendance_update'));
  };

  // Trigger dynamic re-fetch protocols across the sidebar when internal tabs update telemetry
  useEffect(() => {
    if (typeof fetchStatus === 'function') {
      fetchStatus();
    }
    
    // Automatically capture state dispatch actions when other views commit mutations
    window.addEventListener('storage', fetchStatus);
    return () => window.removeEventListener('storage', fetchStatus);
  }, [activeTab, fetchStatus]);

  const navigationOptions = [
    { id: 'checkin', name: 'Check In Routing', category: 'Operational Core' },
    { id: 'checkout', name: 'Check Out Routing', category: 'Operational Core' },
    { id: 'history', name: 'History Table', category: 'Analytics Layer' },
    { id: 'calendar', name: 'Matrix Calendar', category: 'Analytics Layer' },
    { id: 'report', name: 'Production Report', category: 'Analytics Layer' },
    { id: 'summary', name: 'Work Summary Audit', category: 'Analytics Layer' },
    { id: 'tracking', name: 'Live Tracking Link', category: 'Spatial Matrix' },
    { id: 'mapview', name: 'Topology View', category: 'Spatial Matrix' },
    { id: 'shifts', name: 'Shift Management', category: 'Administration' },
    { id: 'geofence', name: 'Geofence Directives', category: 'Administration' },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'checkin': return <CheckIn />;
      case 'checkout': return <CheckOut />;
      case 'history': return <AttendanceHistory />;
      case 'calendar': return <AttendanceCalendar />;
      case 'report': return <AttendanceReport />;
      case 'tracking': return <LiveTracking />;
      case 'shifts': return <ShiftManagement />;
      case 'geofence': return <GeofenceSettings />;
      case 'mapview': return <MapView />;
      case 'summary': return <WorkSummary />;
      default: return <CheckIn />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <svg className="animate-spin h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-slate-500 font-bold mt-3 tracking-wider uppercase">Loading Core Operational Matrix...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-slate-900 text-white flex flex-col border-r border-slate-950 shadow-xl z-20">
        <div className="p-6 border-b border-slate-800/60 flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-900/40">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">CHRONOS GATE</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Enterprise Attendance</p>
          </div>
        </div>

        {/* Employee context selector */}
        <div className="px-6 py-4 border-b border-slate-800/40 space-y-1.5">
          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Select Employee Context</label>
          <select 
            value={currentEmployeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer transition-all"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 border-b border-slate-800/40">
          <WorkHourCard checkInTime={todayRecord?.checkIn} checkOutTime={todayRecord?.checkOut} />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {['Operational Core', 'Analytics Layer', 'Spatial Matrix', 'Administration'].map(category => (
            <div key={category} className="space-y-1">
              <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2">{category}</span>
              {navigationOptions.filter(o => o.category === category).map(option => (
                <button
                  key={option.id}
                  onClick={() => setActiveTab(option.id)}
                  className={`w-full flex items-center justify-between text-xs font-bold py-2.5 px-3 rounded-xl transition-all duration-150 relative group ${
                    activeTab === option.id 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span>{option.name}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 ${activeTab === option.id ? 'opacity-100' : 'opacity-30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Production Workspace Viewer */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-slate-100/80 shadow-sm p-6 md:p-8 min-h-[calc(100vh-5rem)] flex flex-col justify-between">
          <div className="flex-1">
            {renderActiveView()}
          </div>
          <footer className="mt-12 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono tracking-wider uppercase">
            CHRONOS GATE SECURITY PROTOCOLS ENFORCED // OPERATIONAL YEAR 2026
          </footer>
        </div>
      </main>
    </div>
  );
};