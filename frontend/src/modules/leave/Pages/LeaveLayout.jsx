import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const LeaveLayout = () => {
  const navigate = useNavigate();

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
      flexWrap: 'wrap' // Ensures buttons don't overflow on smaller screens
    },
    navButton: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    }
  };

  const handleMouseOver = (e) => e.target.style.backgroundColor = '#0056b3';
  const handleMouseOut = (e) => e.target.style.backgroundColor = '#007bff';

  return (
    <div style={styles.container}>
      {/* Static Header & Navigation Buttons */}
      <div style={styles.headerWrapper}>
        <h1 style={styles.title}>Leave Management</h1>
        
        <div style={styles.buttonContainer}>
          <button style={styles.navButton} onClick={() => navigate('/leave')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Balance
          </button>
          <button style={styles.navButton} onClick={() => navigate('/leave/apply')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Apply for Leave
          </button>
          <button style={styles.navButton} onClick={() => navigate('/leave/calendar')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Calendar
          </button>
          <button style={styles.navButton} onClick={() => navigate('/leave/policy')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Policy
          </button>
          <button style={styles.navButton} onClick={() => navigate('/leave/history')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            History
          </button>
          <button style={styles.navButton} onClick={() => navigate('/leave/approval')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Approvals
          </button>
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