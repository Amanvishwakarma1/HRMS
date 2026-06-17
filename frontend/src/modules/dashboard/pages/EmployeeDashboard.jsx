import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Receipt, FileText, ArrowRight } from 'lucide-react';

// Importing your specific modules
import QuickAttendance from '../../attendance/components/QuickAttendance';
import UpcomingHolidaysWidget from '../components/UpcomingHolidaysWidget';
import LeaveBalanceWidget from '../../leave/components/LeaveBalanceWidget';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "User" };

  const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
    header: { marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px', marginBottom: '40px' },
    
    // 3D Card Styling
    card: { 
      background: '#ffffff', 
      borderRadius: '24px', 
      padding: '28px', 
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    
    quickLinkBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '20px', marginBottom: '16px',
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px',
      cursor: 'pointer', fontWeight: '600', color: '#334155',
      transition: 'all 0.3s ease', fontSize: '15px'
    }
  };

  const QuickLink = ({ icon: Icon, label, path }) => (
    <button 
      style={styles.quickLinkBtn}
      onClick={() => navigate(path)}
      onMouseOver={(e) => { 
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = '#0ea5e9';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.2)';
      }}
      onMouseOut={(e) => { 
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Icon size={22} color="#0ea5e9" /> {label}
      </div>
      <ArrowRight size={18} color="#94a3b8" />
    </button>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Hello, {storedUser.username.split(' ')[0]} 👋</h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Manage your work, leave, and finances in one place.</p>
      </div>

      <div style={styles.grid}>
        {/* Quick Attendance Widget (Interactive) */}
        <div style={styles.card} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <QuickAttendance />
        </div>
        
        {/* Leave Balance Widget */}
        <div style={styles.card} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <LeaveBalanceWidget balance={12} /> 
        </div>
        
        {/* Upcoming Holidays Widget */}
        <div style={styles.card} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <UpcomingHolidaysWidget />
        </div>
      </div>

      {/* Quick Actions Card */}
      <div style={styles.card}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <QuickLink icon={Calendar} label="Apply for Leave" path="/leave/apply" />
          <QuickLink icon={Receipt} label="Submit Expense" path="/expenses/submit" />
          <QuickLink icon={FileText} label="View Payslips" path="/payroll/payslips" />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;