import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { attendanceService } from '../services/attendanceService';
import { History, Eye, EyeOff, Search } from 'lucide-react';

const AttendanceHistory = () => {
  const [logs, setLogs] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await attendanceService.getLogs();
      if (res.success) {
        setLogs(res.data);
      }
      setIsLoading(false);
    };
    fetchLogs();
  }, []);

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    titleSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left'
    },
    th: {
      padding: '14px 16px',
      borderBottom: '2px solid #e2e8f0',
      color: '#475569',
      fontWeight: '600',
      fontSize: '14px',
      background: '#f8fafc'
    },
    td: {
      padding: '14px 16px',
      borderBottom: '1px solid #e2e8f0',
      color: '#334155',
      fontSize: '14px'
    },
    badge: (status) => {
      let bg = '#f1f5f9';
      let color = '#475569';
      if (status === 'Present') { bg = '#d1fae5'; color = '#065f46'; }
      else if (status === 'Late') { bg = '#fef3c7'; color = '#92400e'; }
      else if (status === 'Half Day') { bg = '#ffe4e6'; color = '#9f1239'; }
      else if (status === 'On Leave') { bg = '#f3e8ff'; color = '#6b21a8'; }
      else if (status === 'Absent') { bg = '#fee2e2'; color = '#991b1b'; }
      return {
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: bg,
        color: color,
        display: 'inline-block'
      };
    },
    expandedRow: {
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer'
    }
  };

  const toggleRow = (date) => {
    if (expandedLog === date) {
      setExpandedLog(null);
    } else {
      setExpandedLog(date);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterStatus === 'All') return true;
    return log.status === filterStatus;
  });

  if (isLoading) return <p style={{ color: '#64748b' }}>Loading punch history...</p>;

  return (
    <div style={styles.card}>
      <div style={styles.titleSection}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="#0ea5e9" />
          Attendance History Logs
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Filter Status:</span>
          <select 
            style={styles.select}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Days</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="On Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>First In</th>
              <th style={styles.th}>Last Out</th>
              <th style={styles.th}>Active Hours</th>
              <th style={styles.th}>Break Hours</th>
              <th style={styles.th} style={{ textAlign: 'center' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                  No attendance records found matching this status filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLog === log.date;
                const dateObj = new Date(log.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const formattedDate = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

                return (
                  <React.Fragment key={log.date}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => toggleRow(log.date)}>
                      <td style={styles.td}>
                        <strong>{formattedDate}</strong> <span style={{ color: '#94a3b8', fontSize: '12px' }}>({dayName})</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge(log.status)}>{log.status}</span>
                      </td>
                      <td style={styles.td}>{log.checkIn}</td>
                      <td style={styles.td}>{log.checkOut}</td>
                      <td style={styles.td}><strong>{log.activeHours} hrs</strong></td>
                      <td style={styles.td}>{log.breakHours} hrs</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        {isExpanded ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#0ea5e9" />}
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr style={styles.expandedRow}>
                        <td colSpan={7} style={{ padding: '16px 32px' }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#1e293b' }}>Detailed Punches for {formattedDate}:</h4>
                          {log.punches && log.punches.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                              {log.punches.map((p, idx) => (
                                <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                                  <div style={{ fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px' }}>Punch {idx + 1}</div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                    <span>In: {p.in}</span>
                                    <span>Out: {p.out}</span>
                                  </div>
                                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
                                    Location: {p.location || 'Office'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No check-in details logged for this day (e.g. Leave or Weekend Off).</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceHistory;
=======
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
>>>>>>> 077d9bac6d2e1f9ec4139220792812a0a3ab0c43
