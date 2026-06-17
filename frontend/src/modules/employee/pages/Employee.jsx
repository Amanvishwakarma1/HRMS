import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const Employee = () => {
  const navigate = useNavigate();

  // Consistent inline styling matching your Leave module
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
        <h1 style={styles.title}>Employee Management</h1>
        <p style={{ color: '#666', margin: '0 0 8px 0' }}>
          View and manage employee information, departments, and designations.
        </p>
        
        <div style={styles.buttonContainer}>
          {/* These paths match the nested routes you set up in App.jsx */}
          <button style={styles.navButton} onClick={() => navigate('/employees')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Employee List
          </button>
          <button style={styles.navButton} onClick={() => navigate('/employees/add')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Add Employee
          </button>
          <button style={styles.navButton} onClick={() => navigate('/employees/departments')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Departments
          </button>
          <button style={styles.navButton} onClick={() => navigate('/employees/designations')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Designations
          </button>
          <button style={styles.navButton} onClick={() => navigate('/employees/chart')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Org Chart
          </button>
          <button style={styles.navButton} onClick={() => navigate('/employees/edit/:id')} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            Edit Employee
          </button>
        </div>
      </div>

      {/* Dynamic Content: This is where EmployeeList, AddEmployee, etc. will appear */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Employee;