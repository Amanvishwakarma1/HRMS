import React from 'react';

const PayrollTable = ({ records }) => {
  const styles = {
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' },
    td: { padding: '12px', borderBottom: '1px solid #e5e7eb' }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Employee Name</th>
            <th style={styles.th}>Basic Pay</th>
            <th style={styles.th}>Deductions</th>
            <th style={styles.th}>Net Salary</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {records?.length > 0 ? (
             records.map((rec, index) => (
              <tr key={index}>
                <td style={styles.td}>{rec.name}</td>
                <td style={styles.td}>₹{rec.basic}</td>
                <td style={styles.td}>₹{rec.deductions}</td>
                <td style={styles.td}>₹{rec.net}</td>
                <td style={styles.td}>{rec.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#666' }}>No payroll records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollTable;