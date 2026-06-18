import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const ExpenseLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/expenses') {
      return location.pathname === '/expenses';
    }
    return location.pathname.startsWith(path);
  };

  // Consistent inline styling matching your Leave and Employee modules
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
        <h1 style={styles.title}>Expense Management</h1>
        <p style={{ color: '#666', margin: '0 0 8px 0' }}>
          Track reimbursements, submit claims, and manage financial policies.
        </p>
        
        <div style={styles.buttonContainer}>
          <button className={`sub-nav-btn ${isActive('/expenses') && !location.pathname.includes('/submit') && !location.pathname.includes('/status') && !location.pathname.includes('/approvals') && !location.pathname.includes('/policy') ? 'active' : ''}`} onClick={() => navigate('/expenses')}>
            Expense History
          </button>
          <button className={`sub-nav-btn ${isActive('/expenses/submit') ? 'active' : ''}`} onClick={() => navigate('/expenses/submit')}>
            Submit Expense
          </button>
          <button className={`sub-nav-btn ${isActive('/expenses/status') ? 'active' : ''}`} onClick={() => navigate('/expenses/status')}>
            Reimbursement Status
          </button>
          <button className={`sub-nav-btn ${isActive('/expenses/approvals') ? 'active' : ''}`} onClick={() => navigate('/expenses/approvals')}>
            Approvals
          </button>
          <button className={`sub-nav-btn ${isActive('/expenses/policy') ? 'active' : ''}`} onClick={() => navigate('/expenses/policy')}>
            Policy
          </button>
        </div>
      </div>

      {/* Dynamic Content: This is where your Expense child pages will appear */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ExpenseLayout;