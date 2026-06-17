import React from 'react';
import PayslipCard from '../components/PayslipCard';

const Payslips = () => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>My Payslips</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        <PayslipCard month="October 2023" netPay="45,000" status="Paid" />
        <PayslipCard month="September 2023" netPay="45,000" status="Paid" />
      </div>
    </div>
  );
};

export default Payslips;