import React, { useState, useEffect } from 'react';
import NotificationCard from '../components/NotificationCard';
import { Mail, CheckSquare } from 'lucide-react';
import { notificationService } from '../services/notificationService';

const Inbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await notificationService.getNotifications();
    if (res.success) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    const res = await notificationService.markRead(id);
    if (res.success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await notificationService.markAllRead();
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <p style={{ color: '#64748b' }}>Loading inbox notifications...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
          General Notifications ({unreadCount} unread)
        </h3>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#0ea5e9', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            <CheckSquare size={16} /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
          <Mail size={32} style={{ margin: '0 auto 12px auto', display: 'block' }} />
          Your inbox is completely clear!
        </div>
      ) : (
        <div>
          {notifications.map(n => (
            <NotificationCard key={n.id} notification={n} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
