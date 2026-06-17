import React from 'react';

const SalaryCard = ({ title, amount, highlight }) => {
  const styles = {
    card: {
      padding: '20px',
      border: highlight ? '2px solid #007bff' : '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: highlight ? '#f0f7ff' : '#ffffff',
    },
    title: { margin: '0 0 8px 0', fontSize: '16px', color: '#666' },
    amount: { margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title || "Component"}</h3>
      <p style={styles.amount}>₹ {amount || "0.00"}</p>
    </div>
  );
};

export default SalaryCard;