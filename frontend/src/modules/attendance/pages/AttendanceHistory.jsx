import React, { useState, useEffect } from 'react';
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
