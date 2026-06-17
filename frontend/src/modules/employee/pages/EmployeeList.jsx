import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#4b5563', fontWeight: '600', fontSize: '14px' },
    td: { padding: '16px', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: '14px' },
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
            <th style={styles.th}>Actions</th>
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
              <td style={styles.td}>
                {/* Dynamically route to the edit page with the specific employee ID */}
                <button 
                  onClick={() => navigate(`/employees/edit/${emp.id}`)}
                  style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;