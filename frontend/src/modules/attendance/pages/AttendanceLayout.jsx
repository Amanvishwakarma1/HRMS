import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, History, PenTool, ShieldAlert, Clock, MapPin } from 'lucide-react';

const AttendanceLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Dashboard', path: '/attendance', icon: <LayoutDashboard size={16} /> },
    { name: 'Calendar', path: '/attendance/calendar', icon: <Calendar size={16} /> },
    { name: 'Punches / History', path: '/attendance/history', icon: <History size={16} /> },
    { name: 'Regularization', path: '/attendance/regularization', icon: <PenTool size={16} /> },
    { name: 'Shift & Schedule', path: '/attendance/shifts', icon: <Clock size={16} /> },
    { name: 'Overtime', path: '/attendance/overtime', icon: <ShieldAlert size={16} /> },
    { name: 'Geofence & GPS', path: '/attendance/geofence', icon: <MapPin size={16} /> },
  ];

  const styles = {
    container: {
      padding: '28px',
      maxWidth: '1200px',
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
      marginBottom: '28px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      scrollbarWidth: 'none' // Firefox
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
      borderRadius: '4px 4px 0 0',
      outline: 'none'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Me & Attendance</h1>
        <p style={styles.subtitle}>Track your work timings, log shifts, and manage logs.</p>
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

export default AttendanceLayout;
