import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const styles = {
    container: { padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' },
    subtitle: { color: '#6b7280', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' },
    listCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' },
    listItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    actionBtn: { padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
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

      <div style={styles.listCard}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Action Required: Team Requests</h2>
        <div style={styles.listItem}>
          <div>
            <strong>Alice Smith</strong>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Sick Leave (2 Days)</p>
          </div>
          <button style={styles.actionBtn} onClick={() => navigate('/leave/approval')}>Review</button>
        </div>
        <div style={{ ...styles.listItem, borderBottom: 'none' }}>
          <div>
            <strong>Charlie Davis</strong>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Client Dinner Expense (₹2,500)</p>
          </div>
          <button style={styles.actionBtn} onClick={() => navigate('/expenses/approvals')}>Review</button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;