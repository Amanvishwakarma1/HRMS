import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const PayrollLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/payroll') {
      return location.pathname === '/payroll';
    }
    return location.pathname.startsWith(path);
  };

  // Consistent inline styling matching your other modules
  const styles = {
    container: {
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    headerWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '24px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      color: '#333'
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .sub-nav-btn {
          background-color: rgba(15, 23, 42, 0.05);
          color: #475569;
          border: 1px solid transparent;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          outline: none;
        }
        .sub-nav-btn:hover {
          background-color: rgba(15, 23, 42, 0.08);
          color: #0f172a;
        }
        .sub-nav-btn.active {
          background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          color: #0f172a;
          font-weight: 700;
          border-color: rgba(15, 23, 42, 0.15);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
      `}</style>
      
      {/* Static Header & Navigation Buttons */}
      <div style={styles.headerWrapper}>
        <h1 style={styles.title}>Payroll Management</h1>
        <p style={{ color: '#666', margin: '0 0 8px 0' }}>
          Process salaries, view payslips, and manage tax declarations.
        </p>
        
        <div style={styles.buttonContainer}>
          <button className={`sub-nav-btn ${isActive('/payroll') && !location.pathname.includes('/payslips') && !location.pathname.includes('/structure') && !location.pathname.includes('/taxes') && !location.pathname.includes('/bonus') && !location.pathname.includes('/reimbursements') ? 'active' : ''}`} onClick={() => navigate('/payroll')}>
            Run Payroll
          </button>
          <button className={`sub-nav-btn ${isActive('/payroll/payslips') ? 'active' : ''}`} onClick={() => navigate('/payroll/payslips')}>
            My Payslips
          </button>
          <button className={`sub-nav-btn ${isActive('/payroll/structure') ? 'active' : ''}`} onClick={() => navigate('/payroll/structure')}>
            Salary Structure
          </button>
          <button className={`sub-nav-btn ${isActive('/payroll/taxes') ? 'active' : ''}`} onClick={() => navigate('/payroll/taxes')}>
            Tax Details
          </button>
          <button className={`sub-nav-btn ${isActive('/payroll/bonus') ? 'active' : ''}`} onClick={() => navigate('/payroll/bonus')}>
            Bonuses
          </button>
          <button className={`sub-nav-btn ${isActive('/payroll/reimbursements') ? 'active' : ''}`} onClick={() => navigate('/payroll/reimbursements')}>
            Reimbursements
          </button>
        </div>
      </div>

      {/* Dynamic Content: This is where your Payroll child pages will appear */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default PayrollLayout;