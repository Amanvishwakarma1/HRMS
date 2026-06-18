import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { MapPin } from 'lucide-react';
// Import the actual employee service to fetch real data!
import { employeeService } from '../../employee/services/employeeService';
import HomeClockInOut from '../../attendance/components/HomeClockInOut';
import ThreeDCard from '../../../components/ThreeDCard';

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
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(15, 23, 42, 0.08)' },
    linkBtn: { color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 },
    actionBtn: { padding: '10px 20px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }
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

      {/* Clock In / Out telemetry widget */}
      <div style={{ marginBottom: '24px' }}>
        <HomeClockInOut />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Dynamic Recent Hires List */}
        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Recent Hires</h2>
            
            {recentHires.length > 0 ? (
              recentHires.map((employee, index) => (
                <div key={employee.id} style={{...styles.row, borderBottom: index === recentHires.length - 1 ? 'none' : '1px solid rgba(15, 23, 42, 0.08)'}}>
                  <span style={{ fontWeight: '500', color: '#334155' }}>{employee.name} ({employee.department})</span>
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
        </ThreeDCard>

        {/* Live Employee Tracking Card */}
        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#0ea5e9" /> Live Tracking Telemetry
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
              Trace all active employees' positions, geofences, and paths live on a single spatial map.
            </p>
            <button 
              className="tactile-btn"
              style={styles.actionBtn} 
              onClick={() => navigate('/attendance/tracking')}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0284c7'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0ea5e9'}
            >
              🗺️ Open Live Tracking Map
            </button>
          </div>
        </ThreeDCard>

        {/* Interactive Policy Update */}
        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Policy Updates</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
              Ensure new updates and compliance changes are distributed to all departments.
            </p>
            <button 
              className="tactile-btn"
              style={styles.actionBtn} 
              onClick={handleBroadcast}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0284c7'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0ea5e9'}
            >
              📢 Broadcast Announcement
            </button>
          </div>
        </ThreeDCard>

        {/* Leave & Approvals Card */}
        <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Leave & Approvals</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
              Review pending leave requests, check balances, and manage team schedules.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="tactile-btn"
                style={styles.actionBtn} 
                onClick={() => navigate('/leave/approval')}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0284c7'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#0ea5e9'}
              >
                ✓ Review Pending Leaves
              </button>
              <button 
                className="tactile-btn"
                style={{ ...styles.actionBtn, backgroundColor: '#64748b' }} 
                onClick={() => navigate('/leave')}
                onMouseOver={(e) => e.target.style.backgroundColor = '#475569'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#64748b'}
              >
                Leave Dashboard
              </button>
            </div>
          </div>
        </ThreeDCard>
        
      </div>
    </div>
  );
};

export default HRDashboard;