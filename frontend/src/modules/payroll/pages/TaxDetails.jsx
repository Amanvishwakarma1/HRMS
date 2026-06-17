import React from 'react';
import TaxSummary from '../components/TaxSummary';

const TaxDetails = () => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Tax Details & Declarations</h2>
      <TaxSummary />
    </div>
  );
};

export default TaxDetails;