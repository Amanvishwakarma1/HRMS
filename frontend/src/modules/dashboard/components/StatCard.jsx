import React from 'react';

const StatCard = ({ title, value, trend, trendText, color }) => {
  const styles = {
    card: {
      padding: '20px',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    title: { margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' },
    value: { margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' },
    trendBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: trend === 'up' ? '#d1fae5' : '#fef2f2',
      color: trend === 'up' ? '#065f46' : '#991b1b'
    },
    footerText: { margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        {/* We use a colored dot to represent the category visually */}
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }}></div>
      </div>
      <div>
        <p style={styles.value}>{value}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={styles.trendBadge}>
            {trend === 'up' ? '↑' : '↓'} {trendText}
          </span>
          <p style={styles.footerText}>vs last month</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;