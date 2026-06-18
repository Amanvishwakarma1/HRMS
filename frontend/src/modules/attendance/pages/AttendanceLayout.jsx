import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, History, PenTool, ShieldAlert, Clock, MapPin, Map, Network } from 'lucide-react';



const AttendanceLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };

  let tabs = [
    { name: 'Dashboard', path: '/attendance', icon: <LayoutDashboard size={16} /> },
    { name: 'Calendar', path: '/attendance/calendar', icon: <Calendar size={16} /> },
    { name: 'Punches / History', path: '/attendance/history', icon: <History size={16} /> },
    { name: 'Regularization', path: '/attendance/regularization', icon: <PenTool size={16} /> },
    { name: 'Shift & Schedule', path: '/attendance/shifts', icon: <Clock size={16} /> },
    { name: 'Overtime', path: '/attendance/overtime', icon: <ShieldAlert size={16} /> },
    { name: 'Geofence & GPS', path: '/attendance/geofence', icon: <MapPin size={16} /> },
    { name: 'Live Tracking', path: '/attendance/tracking', icon: <Map size={16} /> },
    { name: 'Topology View', path: '/attendance/topology', icon: <Network size={16} /> },
  ];

  if (storedUser.role === 'employee') {
    tabs = tabs.filter(tab => tab.path !== '/attendance/geofence' && tab.path !== '/attendance/topology');
  }

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
      paddingBottom: '8px',
      marginBottom: '28px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      scrollbarWidth: 'none' // Firefox
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .att-tab-btn {
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
        .att-tab-btn:hover {
          background-color: rgba(15, 23, 42, 0.08);
          color: #0f172a;
        }
        .att-tab-btn.active {
          background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          background-color: transparent;
          color: #0f172a;
          font-weight: 700;
          border-color: rgba(15, 23, 42, 0.15);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
      `}</style>

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
              className={`att-tab-btn ${isActive ? 'active' : ''}`}
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

export default AttendanceLayout;
