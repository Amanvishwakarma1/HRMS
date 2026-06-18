import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const Employee = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };
  const isEmployee = currentUser.role === 'employee';

  const isActive = (path) => {
    if (path === '/employees') {
      return location.pathname === '/employees';
    }
    return location.pathname.startsWith(path);
  };

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
        <h1 style={styles.title}>Employee Management</h1>
        <p style={{ color: '#666', margin: '0 0 8px 0' }}>
          View and manage employee information, departments, and designations.
        </p>
        
        <div style={styles.buttonContainer}>
          {/* These paths match the nested routes you set up in App.jsx */}
          <button className={`sub-nav-btn ${isActive('/employees') && !location.pathname.includes('/add') && !location.pathname.includes('/departments') && !location.pathname.includes('/designations') && !location.pathname.includes('/chart') && !location.pathname.includes('/edit') ? 'active' : ''}`} onClick={() => navigate('/employees')}>
            Employee List
          </button>
          {!isEmployee && (
            <button className={`sub-nav-btn ${isActive('/employees/add') ? 'active' : ''}`} onClick={() => navigate('/employees/add')}>
              Add Employee
            </button>
          )}
          <button className={`sub-nav-btn ${isActive('/employees/departments') ? 'active' : ''}`} onClick={() => navigate('/employees/departments')}>
            Departments
          </button>
          <button className={`sub-nav-btn ${isActive('/employees/designations') ? 'active' : ''}`} onClick={() => navigate('/employees/designations')}>
            Designations
          </button>
          <button className={`sub-nav-btn ${isActive('/employees/chart') ? 'active' : ''}`} onClick={() => navigate('/employees/chart')}>
            Org Chart
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