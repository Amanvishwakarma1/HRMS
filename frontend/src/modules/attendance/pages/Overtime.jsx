import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { attendanceService } from '../services/attendanceService';

const Overtime = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'User', role: 'employee' };
  const isEmployee = storedUser.role === 'employee';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isEmployee) {
        const activeId = Number(storedUser.id || 4);
        const history = await attendanceService.getAttendanceHistory(activeId);
        setLogs(history);
      }
      setLoading(false);
    };
    loadData();
  }, [isEmployee, storedUser.id]);

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
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
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
    metricBox: {
      padding: '16px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #f1f5f9',
      textAlign: 'center'
    },
    metricValue: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#0ea5e9',
      margin: '8px 0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left'
    },
    th: {
      padding: '12px 16px',
      borderBottom: '2px solid #e2e8f0',
      color: '#475569',
      fontSize: '13px',
      fontWeight: '600'
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #e2e8f0',
      color: '#334155',
      fontSize: '13px'
    }
  };

  const otHistoryMock = [
    { date: '2026-06-06', type: 'Weekend Work (Saturday)', hours: 4.5, multiplier: '1.5x', status: 'Approved' },
    { date: '2026-06-12', type: 'Late Checkout (Weekday)', hours: 2.0, multiplier: '1.25x', status: 'Approved' },
    { date: '2026-06-13', type: 'Weekend Work (Saturday)', hours: 5.0, multiplier: '1.5x', status: 'Approved' }
  ];

  let calculatedOtHistory = [];
  let totalOtHours = 0;
  let weekHours = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };

  if (isEmployee) {
    logs.forEach(log => {
      const checkInTime = log.checkIn ? new Date(log.checkIn) : null;
      const checkOutTime = log.checkOut ? new Date(log.checkOut) : null;
      if (checkInTime && checkOutTime) {
        const diffMs = checkOutTime - checkInTime;
        const activeHours = Math.max(0, diffMs / (1000 * 60 * 60));
        if (activeHours > 8.0) {
          const otHours = parseFloat((activeHours - 8.0).toFixed(2));
          totalOtHours += otHours;

          const dateObj = new Date(log.date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

          calculatedOtHistory.push({
            date: log.date,
            type: isWeekend ? `Weekend Work (${dayName})` : 'Late Checkout (Weekday)',
            hours: otHours,
            multiplier: isWeekend ? '1.5x' : '1.25x',
            status: 'Approved'
          });

          const dayOfMonth = dateObj.getDate();
          let weekKey = 'Week 1';
          if (dayOfMonth <= 7) weekKey = 'Week 1';
          else if (dayOfMonth <= 14) weekKey = 'Week 2';
          else if (dayOfMonth <= 21) weekKey = 'Week 3';
          else if (dayOfMonth <= 28) weekKey = 'Week 4';
          else weekKey = 'Week 5';

          weekHours[weekKey] += otHours;
        }
      }
    });

    calculatedOtHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    calculatedOtHistory = otHistoryMock;
    totalOtHours = 11.5;
  }

  const chartData = isEmployee 
    ? Object.keys(weekHours).map(w => ({ week: w, hours: parseFloat(weekHours[w].toFixed(1)) }))
    : [
        { week: 'Week 1', hours: 0 },
        { week: 'Week 2', hours: 4.5 },
        { week: 'Week 3', hours: 6.5 },
        { week: 'Week 4', hours: 11.5 }
      ];

  if (isEmployee && loading) {
    return <p style={{ color: '#64748b', padding: '24px' }}>Loading overtime details...</p>;
  }

  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.metricBox}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>Accumulated Overtime (June)</div>
          <div style={styles.metricValue}>{totalOtHours.toFixed(1)} Hours</div>
          <div style={{ fontSize: '11px', color: '#22c55e' }}>
            {isEmployee ? 'Calculated from actual history logs' : '+2.5 hrs from last month'}
          </div>
        </div>
        <div style={styles.metricBox}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>OT Multiplier Rate</div>
          <div style={{ ...styles.metricValue, color: '#10b981' }}>1.5x / Hour</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>For Saturdays & Sundays</div>
        </div>
        <div style={styles.metricBox}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>Pending Approvals</div>
          <div style={{ ...styles.metricValue, color: '#eab308' }}>0.0 Hours</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>No pending claims</div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>
          <TrendingUp size={20} color="#0ea5e9" />
          Overtime Hours Cumulative Trend
        </h3>
        
        <div style={{ width: '100%', height: '220px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="hours" stroke="#0ea5e9" fill="rgba(14, 165, 233, 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>
          <ShieldAlert size={20} color="#0ea5e9" />
          Detailed Overtime log list
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Overtime Type</th>
                <th style={styles.th}>Logged Hours</th>
                <th style={styles.th}>Pay Rate</th>
                <th style={styles.th}>Approval Status</th>
              </tr>
            </thead>
            <tbody>
              {calculatedOtHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                    No overtime hours logged for this month.
                  </td>
                </tr>
              ) : (
                calculatedOtHistory.map((ot) => (
                  <tr key={ot.date}>
                    <td style={styles.td}><strong>{ot.date}</strong></td>
                    <td style={styles.td}>{ot.type}</td>
                    <td style={styles.td}><strong>{ot.hours} hrs</strong></td>
                    <td style={styles.td}>{ot.multiplier}</td>
                    <td style={styles.td}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '11px', fontWeight: 'bold' }}>
                        {ot.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overtime;
