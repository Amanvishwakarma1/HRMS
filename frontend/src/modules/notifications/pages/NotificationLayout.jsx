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
      paddingBottom: '8px',
      marginBottom: '28px'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .notif-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 1px solid transparent;
          border-radius: 8px;
          background-color: rgba(15, 23, 42, 0.05);
          color: #475569;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        .notif-tab-btn:hover {
          background-color: rgba(15, 23, 42, 0.08);
          color: #0f172a;
        }
        .notif-tab-btn.active {
          background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          background-color: transparent;
          color: #0f172a;
          font-weight: 700;
          border-color: rgba(15, 23, 42, 0.15);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
      `}</style>

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
              className={`notif-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
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
