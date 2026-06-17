import React from 'react';
import { AlertCircle, FileWarning } from 'lucide-react';

const Alerts = () => {
  const alertsList = [
    { id: 'a1', title: 'Late Punch-in Flagged', message: 'You clocked in at 09:45 AM on June 15, which is outside the 30-minute grace period.', time: 'Yesterday', type: 'late' },
    { id: 'a2', title: 'Missing Check-Out', message: 'No checkout punch was registered for June 10. You should apply for Regularization to adjust this.', time: '5 days ago', type: 'missing' }
  ];

  const styles = {
    card: {
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #fee2e2',
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      marginBottom: '16px',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      borderLeft: '4px solid #ef4444'
    },
    title: {
      margin: '0 0 4px 0',
      fontSize: '15px',
      fontWeight: 'bold'
    },
    desc: {
      margin: '0 0 8px 0',
      fontSize: '13px',
      color: '#b91c1c',
      lineHeight: '1.4'
    },
    time: {
      fontSize: '11px',
      color: '#ef4444'
    }
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
        Critical System Alerts
      </h3>

      {alertsList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
          <FileWarning size={32} style={{ margin: '0 auto 12px auto', display: 'block' }} />
          No critical alerts or policy warnings. Great job!
        </div>
      ) : (
        <div>
          {alertsList.map(alert => (
            <div key={alert.id} style={styles.card}>
              <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#fee2e2', flexShrink: 0 }}>
                <AlertCircle size={22} color="#ef4444" />
              </div>
              <div>
                <h4 style={styles.title}>{alert.title}</h4>
                <p style={styles.desc}>{alert.message}</p>
                <span style={styles.time}>{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
