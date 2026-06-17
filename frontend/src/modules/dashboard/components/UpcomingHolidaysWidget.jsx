import React from 'react';

const UpcomingHolidaysWidget = () => {
  const styles = {
    card: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' },
    title: { margin: '0 0 12px 0', fontSize: '18px', color: '#333' },
    list: { paddingLeft: '20px', margin: 0, color: '#555' }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Upcoming Holidays</h3>
      <ul style={styles.list}>
        <li style={{ marginBottom: '8px' }}>Independence Day - Aug 15th</li>
        <li>Diwali - Oct 31st</li>
      </ul>
    </div>
  );
};

export default UpcomingHolidaysWidget;