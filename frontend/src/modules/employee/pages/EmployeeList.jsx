import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };
  const isEmployee = currentUser.role === 'employee';

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await employeeService.getAllEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
      setIsLoading(false);
    };
    fetchEmployees();
  }, []);

  const styles = {
    card: { background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.75) 0%, rgba(232, 235, 242, 0.75) 50%, rgba(226, 231, 237, 0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.02) 61%, rgba(0,0,0,0.02) 73%), linear-gradient(33deg, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.20) 100%)', backgroundBlendMode: 'normal,color-burn', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.45)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.05)', borderBottom: '2px solid rgba(15, 23, 42, 0.08)', color: '#0f172a', fontWeight: '700', fontSize: '14px' },
    td: { padding: '16px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', color: '#334155', fontSize: '14px' },
    badgeActive: { padding: '4px 8px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' },
    badgeLeave: { padding: '4px 8px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }
  };

  if (isLoading) return <p style={{ color: '#666' }}>Loading employee data...</p>;

  return (
    <div style={styles.card}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Employee ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Designation</th>
            <th style={styles.th}>Status</th>
            {!isEmployee && <th style={styles.th}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td style={styles.td}><strong>{emp.id}</strong></td>
              <td style={styles.td}>
                <div>{emp.name}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{emp.email}</div>
              </td>
              <td style={styles.td}>{emp.department}</td>
              <td style={styles.td}>{emp.designation}</td>
              <td style={styles.td}>
                <span style={emp.status === 'Active' ? styles.badgeActive : styles.badgeLeave}>
                  {emp.status}
                </span>
              </td>
              {!isEmployee && (
                <td style={styles.td}>
                  {/* Dynamically route to the edit page with the specific employee ID */}
                  <button 
                    onClick={() => navigate(`/employees/edit/${emp.id}`)}
                    style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;