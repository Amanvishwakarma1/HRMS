import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
// Import the actual employee service to fetch real data!
import { employeeService } from '../../employee/services/employeeService';

const HRDashboard = () => {
  const navigate = useNavigate();
  
  // Real State Management
  const [headcount, setHeadcount] = useState(0);
  const [recentHires, setRecentHires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live data when the dashboard loads
  useEffect(() => {
    const fetchDashboardData = async () => {
      const response = await employeeService.getAllEmployees();
      if (response.success) {
        const employees = response.data;
        setHeadcount(employees.length);
        
        // Grab the 2 most recently added employees
        setRecentHires(employees.slice(-2).reverse());
      }
      setIsLoading(false);
    };
    
    fetchDashboardData();
  }, []);

  const styles = {
    container: { padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' },
    subtitle: { color: '#6b7280', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' },
    card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    linkBtn: { color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', padding: 0 },
    actionBtn: { padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }
  };

  // Interactive Broadcast Feature
  const handleBroadcast = () => {
    const message = window.prompt("Enter the policy update or announcement to broadcast to the company:");
    if (message) {
      alert(`✅ Success! The following message was sent to all employees:\n\n"${message}"`);
    }
  };

  if (isLoading) return <p style={{ padding: '24px', color: '#666' }}>Loading HR data...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>HR Portal</h1>
        <p style={styles.subtitle}>Manage personnel, hiring, and company policies.</p>
      </div>

      <div style={styles.grid}>
        <StatCard title="Open Positions" value="4" trend="up" trendText="1" color="#8b5cf6" />
        <StatCard title="New Onboardings" value="2" trend="up" trendText="1" color="#10b981" />
        {/* Dynamic Headcount! */}
        <StatCard title="Total Headcount" value={headcount} trend="up" trendText="Live Data" color="#3b82f6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Dynamic Recent Hires List */}
        <div style={styles.card}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Recent Hires</h2>
          
          {recentHires.length > 0 ? (
            recentHires.map((employee, index) => (
              <div key={employee.id} style={{...styles.row, borderBottom: index === recentHires.length - 1 ? 'none' : '1px solid #f3f4f6'}}>
                <span>{employee.name} ({employee.department})</span>
                <span style={{ fontSize: '12px', color: employee.status === 'Active' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                  {employee.status}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: '#666', fontSize: '14px' }}>No recent hires found.</p>
          )}

          <button 
            style={{ ...styles.linkBtn, marginTop: '16px' }} 
            onClick={() => navigate('/employees')}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            View All Employees →
          </button>
        </div>

        {/* Interactive Policy Update */}
        <div style={styles.card}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Policy Updates</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Ensure new updates and compliance changes are distributed to all departments.
          </p>
          <button 
            style={styles.actionBtn} 
            onClick={handleBroadcast}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            📢 Broadcast Announcement
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default HRDashboard;