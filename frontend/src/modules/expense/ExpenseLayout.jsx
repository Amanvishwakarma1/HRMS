import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const ExpenseLayout = () => {
  const navigate = useNavigate();

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
        <h1 style={styles.title}>Expense Management</h1>
        <p style={{ color: '#666', margin: '0 0 8px 0' }}>
          Track reimbursements, submit claims, and manage financial policies.
        </p>
        
        <div style={styles.buttonContainer}>
          <button style={styles.navButton} onClick={() => navigate('/expenses')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Expense History
          </button>
          <button style={styles.navButton} onClick={() => navigate('/expenses/submit')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Submit Expense
          </button>
          <button style={styles.navButton} onClick={() => navigate('/expenses/status')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Reimbursement Status
          </button>
          <button style={styles.navButton} onClick={() => navigate('/expenses/approvals')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Approvals
          </button>
          <button style={styles.navButton} onClick={() => navigate('/expenses/policy')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
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