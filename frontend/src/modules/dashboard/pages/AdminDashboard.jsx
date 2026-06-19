import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../components/StatCard';
import HomeClockInOut from '../../attendance/components/HomeClockInOut';
import ThreeDCard from '../../../components/ThreeDCard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    pendingExpensesSum: 0,
    departmentsCount: 1,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => {
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading admin stats:", err);
        setIsLoading(false);
      });
  }, []);

  const styles = {
    container: { padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' },
    subtitle: { color: '#6b7280', margin: 0 },
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '20px', 
      marginBottom: '24px' 
    },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' },
    feedItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', marginBottom: '16px' },
    feedTime: { fontSize: '12px', color: '#64748b', minWidth: '60px', fontWeight: '600' },
    feedText: { margin: 0, fontSize: '14px', color: '#334155', fontWeight: '500' },
    quickActionButton: {
      padding: '14px 20px', 
      textAlign: 'left', 
      background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.4) 0%, rgba(232, 235, 242, 0.4) 50%, rgba(226, 231, 237, 0.4) 100%)',
      border: '1px solid rgba(15, 23, 42, 0.12)', 
      borderRadius: '12px', 
      cursor: 'pointer', 
      fontWeight: '600',
      transition: 'all 0.2s ease',
      color: '#0f172a'
    }
  };



  const handleHover = (e) => {
    e.target.style.borderColor = '#0ea5e9';
    e.target.style.backgroundColor = 'rgba(14, 165, 233, 0.08)';
    e.target.style.transform = 'translateY(-2px)';
  };
  const handleHoverOut = (e) => {
    e.target.style.borderColor = 'rgba(15, 23, 42, 0.12)';
    e.target.style.backgroundColor = 'transparent';
    e.target.style.transform = 'translateY(0)';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Company Overview</h1>
        <p style={styles.subtitle}>Welcome back, Admin. Here is what's happening today.</p>
      </div>

      <div style={styles.grid}>
        <StatCard title="Total Employees" value={stats.totalEmployees} trend="up" trendText="Live" color="#3b82f6" />
        <StatCard title="Active Leave Requests" value={stats.pendingLeaves} trend="up" trendText="Live" color="#f59e0b" />
        <StatCard title="Pending Expenses" value={`₹${stats.pendingExpensesSum.toLocaleString()}`} trend="down" trendText="Live" color="#ef4444" />
        <StatCard title="Departments" value={stats.departmentsCount} trend="up" trendText="Live" color="#10b981" />
      </div>

      {/* Clock In / Out telemetry widget */}
      <div style={{ marginBottom: '24px' }}>
        <HomeClockInOut />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={styles.sectionTitle}>Recent Activity</h2>
            <div>
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} style={{
                    ...styles.feedItem, 
                    borderBottom: index === stats.recentActivity.length - 1 ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
                    marginBottom: index === stats.recentActivity.length - 1 ? '0' : '16px',
                    paddingBottom: index === stats.recentActivity.length - 1 ? '0' : '16px'
                  }}>
                    <span style={styles.feedTime}>{activity.time}</span>
                    <p style={styles.feedText}>{activity.text}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#666', fontSize: '14px' }}>No recent activity.</p>
              )}
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <button 
                className="tactile-btn"
                style={styles.quickActionButton} 
                onClick={() => navigate('/employees/add')}
                onMouseOver={handleHover}
                onMouseOut={handleHoverOut}
              >
                + Add New Employee
              </button>

              <button 
                className="tactile-btn"
                style={styles.quickActionButton} 
                onClick={() => navigate('/leave/approval')}
                onMouseOver={handleHover}
                onMouseOut={handleHoverOut}
              >
                ✓ Review Pending Leaves
              </button>

              <button 
                className="tactile-btn"
                style={styles.quickActionButton} 
                onClick={() => navigate('/expenses/approvals')}
                onMouseOver={handleHover}
                onMouseOut={handleHoverOut}
              >
                $ Process Reimbursements
              </button>

              <button 
                className="tactile-btn"
                style={styles.quickActionButton} 
                onClick={() => navigate('/attendance/tracking')}
                onMouseOver={handleHover}
                onMouseOut={handleHoverOut}
              >
                🗺️ Trace All Employees on Map
              </button>

            </div>
          </div>
        </ThreeDCard>

      </div>
    </div>
  );
};

export default AdminDashboard;