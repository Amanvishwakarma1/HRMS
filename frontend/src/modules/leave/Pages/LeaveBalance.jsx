import React from 'react';
import LeaveBalanceWidget from '../components/LeaveBalanceWidget';

const LeaveBalance = () => {
  const styles = {
    widgetGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#444' }}>Current Balances</h2>
      <div style={styles.widgetGrid}>
        <LeaveBalanceWidget balance={12} />
        {/* Add more widgets here */}
      </div>
    </div>
  );
};

export default LeaveBalance;