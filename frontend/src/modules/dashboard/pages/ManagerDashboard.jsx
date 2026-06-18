import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import HomeClockInOut from '../../attendance/components/HomeClockInOut';
import ThreeDCard from '../../../components/ThreeDCard';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const styles = {
    container: { padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' },
    subtitle: { color: '#6b7280', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(15, 23, 42, 0.08)' },
    actionBtn: { padding: '8px 16px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Team Dashboard</h1>
        <p style={styles.subtitle}>Overview of your engineering team.</p>
      </div>

      <div style={styles.grid}>
        <StatCard title="Team Size" value="12" trend="up" trendText="0%" color="#3b82f6" />
        <StatCard title="Team on Leave Today" value="2" trend="down" trendText="" color="#ef4444" />
        <StatCard title="Pending Approvals" value="5" trend="up" trendText="2" color="#f59e0b" />
      </div>

      {/* Clock In / Out telemetry widget */}
      <div style={{ marginBottom: '24px' }}>
        <HomeClockInOut />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Action Required: Team Requests</h2>
            <div style={styles.listItem}>
              <div>
                <strong style={{ color: '#0f172a' }}>Alice Smith</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>Sick Leave (2 Days)</p>
              </div>
              <button className="tactile-btn" style={styles.actionBtn} onClick={() => navigate('/leave/approval')}>Review</button>
            </div>
            <div style={{ ...styles.listItem, borderBottom: 'none' }}>
              <div>
                <strong style={{ color: '#0f172a' }}>Charlie Davis</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>Client Dinner Expense (₹2,500)</p>
              </div>
              <button className="tactile-btn" style={styles.actionBtn} onClick={() => navigate('/expenses/approvals')}>Review</button>
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Live Employee Tracking</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
              Trace all active team members' locations and check-in logs live on a spatial map.
            </p>
            <button className="tactile-btn" style={{ ...styles.actionBtn, backgroundColor: '#0ea5e9' }} onClick={() => navigate('/attendance/tracking')}>
              🗺️ Trace Employees
            </button>
          </div>
        </ThreeDCard>

      </div>
    </div>
  );
};

export default ManagerDashboard;