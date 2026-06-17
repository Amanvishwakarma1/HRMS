import React from 'react';
import SalaryCard from '../components/SalaryCard';

const SalaryStructure = () => {
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' };

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>My Salary Structure</h2>
      <div style={gridStyle}>
        <SalaryCard title="Basic Salary" amount="25,000" highlight={true} />
        <SalaryCard title="House Rent Allowance (HRA)" amount="10,000" />
        <SalaryCard title="Special Allowance" amount="8,000" />
        <SalaryCard title="Provident Fund (PF)" amount="-1,800" />
      </div>
    </div>
  );
};

export default SalaryStructure;