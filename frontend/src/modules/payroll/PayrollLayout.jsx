import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const PayrollLayout = () => {
  const navigate = useNavigate();

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
        <h1 style={styles.title}>Payroll Management</h1>
        <p style={{ color: '#666', margin: '0 0 8px 0' }}>
          Process salaries, view payslips, and manage tax declarations.
        </p>
        
        <div style={styles.buttonContainer}>
          <button style={styles.navButton} onClick={() => navigate('/payroll')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Run Payroll
          </button>
          <button style={styles.navButton} onClick={() => navigate('/payroll/payslips')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            My Payslips
          </button>
          <button style={styles.navButton} onClick={() => navigate('/payroll/structure')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Salary Structure
          </button>
          <button style={styles.navButton} onClick={() => navigate('/payroll/taxes')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Tax Details
          </button>
          <button style={styles.navButton} onClick={() => navigate('/payroll/bonus')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Bonuses
          </button>
          <button style={styles.navButton} onClick={() => navigate('/payroll/reimbursements')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
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