import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Inbox, AlertTriangle, Megaphone } from 'lucide-react';

const NotificationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Inbox', path: '/notifications', icon: <Inbox size={16} /> },
    { name: 'Critical Alerts', path: '/notifications/alerts', icon: <AlertTriangle size={16} /> },
    { name: 'Company Announcements', path: '/notifications/announcements', icon: <Megaphone size={16} /> }
  ];

  const styles = {
    container: {
      padding: '28px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1e293b'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#0f172a',
      margin: '0 0 4px 0',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '14px',
      margin: 0
    },
    tabBar: {
      display: 'flex',
      gap: '8px',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '0px',
      marginBottom: '28px'
    },
    tabButton: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 18px',
      border: 'none',
      borderBottom: isActive ? '3px solid #0ea5e9' : '3px solid transparent',
      background: 'none',
      color: isActive ? '#0ea5e9' : '#64748b',
      fontWeight: isActive ? '600' : '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Inbox Center</h1>
        <p style={styles.subtitle}>Check your latest alerts, tasks approvals, and system announcements.</p>
      </div>

      <div style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              style={styles.tabButton(isActive)}
              onClick={() => navigate(tab.path)}
              onMouseEnter={(e) => {
                if (!isActive) e.target.style.color = '#0ea5e9';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.target.style.color = '#64748b';
              }}
            >
              {tab.icon}
              {tab.name}
            </button>
          );
        })}
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default NotificationLayout;
