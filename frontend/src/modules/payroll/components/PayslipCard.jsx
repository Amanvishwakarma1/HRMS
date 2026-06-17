import React from 'react';

const PayslipCard = ({ month, netPay, status }) => {
  const styles = {
    card: { padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    details: { display: 'flex', flexDirection: 'column', gap: '4px' },
    month: { margin: 0, fontWeight: 'bold', fontSize: '16px' },
    pay: { margin: 0, color: '#666' },
    button: { padding: '8px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }
  };

  return (
    <div style={styles.card}>
      <div style={styles.details}>
        <h4 style={styles.month}>{month || "Current Month"}</h4>
        <p style={styles.pay}>Net Pay: ₹ {netPay || "0.00"}</p>
        <small style={{ color: status === 'Paid' ? '#10b981' : '#f59e0b' }}>Status: {status || "Pending"}</small>
      </div>
      <button style={styles.button}>Download PDF</button>
    </div>
  );
};

export default PayslipCard;