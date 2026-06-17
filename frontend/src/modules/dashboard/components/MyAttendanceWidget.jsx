import React from 'react';

const MyAttendanceWidget = () => {
  const styles = {
    card: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' },
    title: { margin: '0 0 12px 0', fontSize: '18px', color: '#333' },
    status: { color: '#16a34a', fontWeight: 'bold' } 
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Today's Attendance</h3>
      <p>Status: <span style={styles.status}>Present</span></p>
      <p style={{ color: '#666', marginTop: '8px' }}>Checked in at: 09:00 AM</p>
    </div>
  );
};

export default MyAttendanceWidget;