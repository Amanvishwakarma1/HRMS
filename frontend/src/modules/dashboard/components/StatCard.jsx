import React from 'react';
import ThreeDCard from '../../../components/ThreeDCard';

const StatCard = ({ title, value, trend, trendText, color }) => {
  const styles = {
    card: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: '140px',
      background: 'transparent',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    title: { margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    value: { margin: 0, fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px' },
    trendBadge: {
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: trend === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      color: trend === 'up' ? '#065f46' : '#991b1b',
      border: trend === 'up' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
    },
    footerText: { margin: '8px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }
  };

  return (
    <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          {/* We use a colored dot to represent the category visually */}
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
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
    </ThreeDCard>
  );
};

export default StatCard;