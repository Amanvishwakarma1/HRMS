import React, { useState, useEffect } from 'react';
import { AttendanceTable } from '../components/AttendanceTable';
import { attendanceService } from '../services/attendanceService';

export const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Database Log Pipeline Synchronizer
  const pullLogs = () => {
    setLoading(true);
    const activeEmpId = Number(localStorage.getItem('active_employee_id') || '2');
    attendanceService.getAttendanceHistory(activeEmpId)
      .then(history => {
        // Chronological order configuration (Newest logged events appear first)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(history);
        setFilteredRecords(history);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history matrix:", err);
        setRecords([]);
        setFilteredRecords([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    pullLogs();
    
    // Cross-tab / Cross-view structural live listener hook
    window.addEventListener('storage', pullLogs);
    window.addEventListener('attendance_update', pullLogs);
    return () => {
      window.removeEventListener('storage', pullLogs);
      window.removeEventListener('attendance_update', pullLogs);
    };
  }, []);

  // 2. Filter Application Handlers
  const handleFilterApplication = (e) => {
    e.preventDefault();
    let computed = [...records];
    if (startDate) {
      computed = computed.filter(r => r.date >= startDate);
    }
    if (endDate) {
      computed = computed.filter(r => r.date <= endDate);
    }
    setFilteredRecords(computed);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilteredRecords(records);
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational Verification Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">Immutable multi-node verification records system history logs.</p>
        </div>

        {/* DATE FORM TOOLBAR */}
        <form onSubmit={handleFilterApplication} className="flex flex-wrap items-end gap-3 bg-white p-3 border border-slate-100 shadow-sm rounded-xl text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Key</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-700 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Key</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-700 bg-slate-50"
            />
          </div>
          <div className="flex space-x-1.5">
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 px-3 rounded shadow-sm transition-colors">
              Filter
            </button>
            <button type="button" onClick={clearFilters} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-1.5 px-3 rounded border border-slate-200 transition-colors">
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* RENDER ACTIVE HISTORY TABLE MATRIX */}
      <AttendanceTable records={filteredRecords} loading={loading} />
      
      {/* SYSTEM META METRIC TRACKER */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-600 flex justify-between items-center">
        <span>System Log Buffer Pipeline Status:</span>
        <span className="text-emerald-600 font-bold tracking-wide uppercase">
          Telemetry Interlocked & Stream Synchronized
        </span>
      </div>
    </div>
  );
};