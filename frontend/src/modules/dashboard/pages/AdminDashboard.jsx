import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import StatCard from '../components/StatCard';

const AdminDashboard = () => {
  const navigate = useNavigate(); // 2. Initialize navigate

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
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#374151', marginBottom: '16px' },
    feedCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' },
    feedItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6', marginBottom: '16px' },
    feedTime: { fontSize: '12px', color: '#9ca3af', minWidth: '60px' },
    feedText: { margin: 0, fontSize: '14px', color: '#374151' },
    // Added a reusable style for the action buttons
    quickActionButton: {
      padding: '12px', 
      textAlign: 'left', 
      backgroundColor: '#fff', 
      border: '1px solid #e5e7eb', 
      borderRadius: '6px', 
      cursor: 'pointer', 
      fontWeight: '500',
      transition: 'border-color 0.2s',
      color: '#374151'
    }
  };

  const recentActivity = [
    { id: 1, time: '10:42 AM', text: 'Alice Smith submitted a Leave Request for Oct 15-18.' },
    { id: 2, time: '09:15 AM', text: 'Bob Johnson uploaded a new Expense Receipt (₹4,500).' },
    { id: 3, time: 'Yesterday', text: 'New employee Charlie Davis was added to the Sales department.' },
    { id: 4, time: 'Yesterday', text: 'Payroll for September was successfully processed.' },
  ];

  const handleHover = (e) => e.target.style.borderColor = '#007bff';
  const handleHoverOut = (e) => e.target.style.borderColor = '#e5e7eb';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Company Overview</h1>
        <p style={styles.subtitle}>Welcome back, Admin. Here is what's happening today.</p>
      </div>

      <div style={styles.grid}>
        <StatCard title="Total Employees" value="142" trend="up" trendText="4%" color="#3b82f6" />
        <StatCard title="Active Leave Requests" value="12" trend="up" trendText="15%" color="#f59e0b" />
        <StatCard title="Pending Expenses" value="₹24,500" trend="down" trendText="8%" color="#ef4444" />
        <StatCard title="Departments" value="8" trend="up" trendText="0%" color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        <div style={styles.feedCard}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          <div>
            {recentActivity.map((activity, index) => (
              <div key={activity.id} style={{
                ...styles.feedItem, 
                borderBottom: index === recentActivity.length - 1 ? 'none' : '1px solid #f3f4f6',
                marginBottom: index === recentActivity.length - 1 ? '0' : '16px',
                paddingBottom: index === recentActivity.length - 1 ? '0' : '16px'
              }}>
                <span style={styles.feedTime}>{activity.time}</span>
                <p style={styles.feedText}>{activity.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.feedCard, backgroundColor: '#f8fafc' }}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* 3. Wired up the buttons with onClick and the router paths */}
            <button 
              style={styles.quickActionButton} 
              onClick={() => navigate('/employees/add')}
              onMouseOver={handleHover}
              onMouseOut={handleHoverOut}
            >
              + Add New Employee
            </button>

            <button 
              style={styles.quickActionButton} 
              onClick={() => navigate('/leave/approval')}
              onMouseOver={handleHover}
              onMouseOut={handleHoverOut}
            >
              ✓ Review Pending Leaves
            </button>

            <button 
              style={styles.quickActionButton} 
              onClick={() => navigate('/expenses/approvals')}
              onMouseOver={handleHover}
              onMouseOut={handleHoverOut}
            >
              $ Process Reimbursements
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;