import React from 'react';

const UpcomingHolidaysWidget = () => {
  const styles = {
    title: { margin: '0 0 12px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' },
    list: { paddingLeft: '20px', margin: 0, color: '#475569', fontSize: '14px' }
  };

  return (
    <div>
      <h3 style={styles.title}>Upcoming Holidays</h3>
      <ul style={styles.list}>
        <li style={{ marginBottom: '8px' }}>Independence Day - Aug 15th</li>
        <li>Diwali - Oct 31st</li>
      </ul>
    </div>
  );
};

export default UpcomingHolidaysWidget;