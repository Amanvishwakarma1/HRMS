import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const LeaveLayout = () => {
  const navigate = useNavigate();

  // Get current user role from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };
  const showApprovals = ['admin', 'manager', 'hr'].includes(currentUser.role?.toLowerCase());

  const location = useLocation();

  const isActive = (path) => {
    if (path === '/leave') {
      return location.pathname === '/leave';
    }
    return location.pathname.startsWith(path);
  };

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
        <h1 style={styles.title}>Leave Management</h1>
        
        <div style={styles.buttonContainer}>
          <button className={`sub-nav-btn ${isActive('/leave') ? 'active' : ''}`} onClick={() => navigate('/leave')}>
            Balance
          </button>
          <button className={`sub-nav-btn ${isActive('/leave/apply') ? 'active' : ''}`} onClick={() => navigate('/leave/apply')}>
            Apply for Leave
          </button>
          <button className={`sub-nav-btn ${isActive('/leave/calendar') ? 'active' : ''}`} onClick={() => navigate('/leave/calendar')}>
            Calendar
          </button>
          <button className={`sub-nav-btn ${isActive('/leave/policy') ? 'active' : ''}`} onClick={() => navigate('/leave/policy')}>
            Policy
          </button>
          <button className={`sub-nav-btn ${isActive('/leave/history') ? 'active' : ''}`} onClick={() => navigate('/leave/history')}>
            History
          </button>
          {showApprovals && (
            <button className={`sub-nav-btn ${isActive('/leave/approval') ? 'active' : ''}`} onClick={() => navigate('/leave/approval')}>
              Approvals
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Content renders here based on the route */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default LeaveLayout;