import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../components/StatCard';
import HomeClockInOut from '../../attendance/components/HomeClockInOut';
import ThreeDCard from '../../../components/ThreeDCard';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teamSize: 0,
    teamLeavesToday: 0,
    pendingApprovalsCount: 0,
    teamRequests: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/manager-stats')
      .then(res => {
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading manager stats:", err);
        setIsLoading(false);
      });
  }, []);

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
        <StatCard title="Team Size" value={stats.teamSize} trend="up" trendText="Live" color="#3b82f6" />
        <StatCard title="Team on Leave Today" value={stats.teamLeavesToday} trend="down" trendText="" color="#ef4444" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovalsCount} trend="up" trendText="Live" color="#f59e0b" />
      </div>

      {/* Clock In / Out telemetry widget */}
      <div style={{ marginBottom: '24px' }}>
        <HomeClockInOut />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Action Required: Team Requests</h2>
            {stats.teamRequests && stats.teamRequests.length > 0 ? (
              stats.teamRequests.map((req, index) => (
                <div key={req.id} style={{ 
                  ...styles.listItem, 
                  borderBottom: index === stats.teamRequests.length - 1 ? 'none' : '1px solid rgba(15, 23, 42, 0.08)' 
                }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{req.name}</strong>
                    <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{req.type}</p>
                  </div>
                  <button className="tactile-btn" style={styles.actionBtn} onClick={() => navigate(req.actionPath)}>Review</button>
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontSize: '14px' }}>No pending team requests.</p>
            )}
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