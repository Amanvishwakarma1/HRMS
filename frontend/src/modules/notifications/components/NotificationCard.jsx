import React from 'react';
import { Mail, AlertCircle, Bell, CheckCircle2, Circle } from 'lucide-react';

const NotificationCard = ({ notification, onMarkRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'alert':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'success':
        return <CheckCircle2 size={20} color="#22c55e" />;
      case 'announcement':
        return <Bell size={20} color="#a855f7" />;
      case 'info':
      default:
        return <Mail size={20} color="#0ea5e9" />;
    }
  };

  const styles = {
    card: {
      display: 'flex',
      gap: '16px',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      backgroundColor: notification.isRead ? '#ffffff' : '#f8fafc',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      marginBottom: '12px',
      position: 'relative',
      transition: 'all 0.2s',
      borderLeft: notification.isRead ? '1px solid #e2e8f0' : '4px solid #0ea5e9'
    },
    title: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: notification.isRead ? '600' : '700',
      color: '#1e293b'
    },
    message: {
      margin: '0 0 8px 0',
      fontSize: '13px',
      color: '#64748b',
      lineHeight: '1.4'
    },
    time: {
      fontSize: '11px',
      color: '#94a3b8'
    },
    actionBtn: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      padding: 0
    }
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
        {getIcon()}
      </div>

      <div style={{ flex: 1, paddingRight: '24px' }}>
        <h4 style={styles.title}>{notification.title}</h4>
        <p style={styles.message}>{notification.message}</p>
        <span style={styles.time}>{notification.time}</span>
      </div>

      {!notification.isRead && (
        <button 
          style={styles.actionBtn} 
          onClick={() => onMarkRead(notification.id)}
          title="Mark as Read"
          onMouseEnter={(e) => e.target.style.color = '#0ea5e9'}
          onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
        >
          <Circle size={16} fill="#0ea5e9" color="#0ea5e9" />
        </button>
      )}
    </div>
  );
};

export default NotificationCard;
