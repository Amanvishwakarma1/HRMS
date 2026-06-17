import React from 'react';
import PayrollTable from '../components/PayrollTable';

const PayrollProcessing = () => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Run Payroll</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Review and process the current month's payroll for all employees.</p>
      <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        Run Payroll for Current Month
      </button>
      <PayrollTable records={[]} />
    </div>
  );
};

export default PayrollProcessing;