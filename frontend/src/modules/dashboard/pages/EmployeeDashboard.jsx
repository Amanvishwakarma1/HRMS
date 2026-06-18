import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Receipt, FileText, ArrowRight } from 'lucide-react';

// Importing your specific modules
import HomeClockInOut from '../../attendance/components/HomeClockInOut';
import UpcomingHolidaysWidget from '../components/UpcomingHolidaysWidget';
import LeaveBalanceWidget from '../../leave/components/LeaveBalanceWidget';
import ThreeDCard from '../../../components/ThreeDCard';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "User" };

  const styles = {
    container: { padding: '0 0 40px 0', maxWidth: '1200px', margin: '0 auto', background: 'transparent', fontFamily: 'Inter, system-ui, sans-serif' },
    header: { marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px', marginBottom: '40px' },
    
    quickLinkBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '20px', marginBottom: '16px',
      background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.75) 0%, rgba(232, 235, 242, 0.7) 50%, rgba(226, 231, 237, 0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.02) 61%, rgba(0,0,0,0.02) 73%), linear-gradient(33deg, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.20) 100%)',
      backgroundBlendMode: 'normal,color-burn',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '18px',
      cursor: 'pointer', fontWeight: '600', color: '#0f172a',
      transition: 'all 0.3s ease', fontSize: '15px'
    }
  };

  const QuickLink = ({ icon: Icon, label, path }) => (
    <button 
      className="tactile-btn"
      style={styles.quickLinkBtn}
      onClick={() => navigate(path)}
      onMouseOver={(e) => { 
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
        e.currentTarget.style.borderColor = '#0ea5e9';
        e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(14, 165, 233, 0.25)';
      }}
      onMouseOut={(e) => { 
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>
        <div style={{ transform: 'translateZ(15px)', transition: 'transform 0.3s' }}>
          <Icon size={22} color="#0ea5e9" />
        </div>
        <span>{label}</span>
      </div>
      <ArrowRight size={18} color="#94a3b8" />
    </button>
  );

  return (
    <div style={styles.container}>
      {/* Welcome Greeting Banner (Gradient Card) */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '24px',
        padding: '32px 40px',
        color: '#1e293b',
        marginBottom: '40px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Ambient background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px', color: '#0f172a' }}>
          Hello, {storedUser.username.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#475569', fontSize: '16px', margin: 0, fontWeight: '500' }}>
          Manage your work, leave, and finances in one place.
        </p>
      </div>

      {/* Clock In / Out telemetry portal */}
      <div style={{ marginBottom: '40px' }}>
        <HomeClockInOut />
      </div>

      {/* Quick Actions Card */}
      <ThreeDCard depth="20px" style={{ marginBottom: '40px', borderRadius: '24px' }}>
        <div style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#1e293b', margin: '0 0 24px 0' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <QuickLink icon={Calendar} label="Apply for Leave" path="/leave/apply" />
            <QuickLink icon={Receipt} label="Submit Expense" path="/expenses/submit" />
            <QuickLink icon={FileText} label="View Payslips" path="/payroll/payslips" />
          </div>
        </div>
      </ThreeDCard>

      <div style={styles.grid}>
        {/* Leave Balance Widget */}
        <ThreeDCard depth="25px" style={{ borderRadius: '24px' }}>
          <div style={{ padding: '28px', height: '100%' }}>
            <LeaveBalanceWidget balance={12} /> 
          </div>
        </ThreeDCard>
        
        {/* Upcoming Holidays Widget */}
        <ThreeDCard depth="25px" style={{ borderRadius: '24px' }}>
          <div style={{ padding: '28px', height: '100%' }}>
            <UpcomingHolidaysWidget />
          </div>
        </ThreeDCard>
      </div>
    </div>
  );
};

export default EmployeeDashboard;