import React from 'react';

const TaxSummary = () => {
  const styles = {
    container: { padding: '16px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px' },
    title: { margin: '0 0 12px 0', color: '#be123c' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Tax Summary (YTD)</h3>
      <div style={styles.row}><span>Total Taxable Income:</span> <strong>₹ 5,00,000</strong></div>
      <div style={styles.row}><span>Tax Deducted at Source (TDS):</span> <strong>₹ 45,000</strong></div>
    </div>
  );
};

export default TaxSummary;