import React from 'react';
import { ShieldAlert, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Overtime = () => {
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

  const otHistory = [
    { date: '2026-06-06', type: 'Weekend Work (Saturday)', hours: 4.5, multiplier: '1.5x', status: 'Approved' },
    { date: '2026-06-12', type: 'Late Checkout (Weekday)', hours: 2.0, multiplier: '1.25x', status: 'Approved' },
    { date: '2026-06-13', type: 'Weekend Work (Saturday)', hours: 5.0, multiplier: '1.5x', status: 'Approved' }
  ];

  const chartData = [
    { week: 'Week 1', hours: 0 },
    { week: 'Week 2', hours: 4.5 },
    { week: 'Week 3', hours: 6.5 },
    { week: 'Week 4', hours: 11.5 }
  ];

  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.metricBox}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>Accumulated Overtime (June)</div>
          <div style={styles.metricValue}>11.5 Hours</div>
          <div style={{ fontSize: '11px', color: '#22c55e' }}>+2.5 hrs from last month</div>
        </div>
        <div style={styles.metricBox}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>OT Multiplier Rate</div>
          <div style={{ ...styles.metricValue, color: '#10b981' }}>1.5x / Hour</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>For Saturdays & Holidays</div>
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
              {otHistory.map((ot) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overtime;
