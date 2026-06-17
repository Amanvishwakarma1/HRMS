import React from 'react';
import { Megaphone, Calendar } from 'lucide-react';

const Announcements = () => {
  const list = [
    { id: '1', title: 'Mid-Year Townhall 2026', content: 'Our Mid-Year Townhall is scheduled for Friday, June 26th at 04:00 PM. We will review Q2 achievements and share the product roadmap for H2. Attendance is mandatory for all team members.', date: 'June 16, 2026', author: 'CEO Office' },
    { id: '2', title: 'World Environment Day Holiday', content: 'In celebration of World Environment Day, the office will remain closed on Friday, June 5th. Enjoy your long weekend!', date: 'June 01, 2026', author: 'HR Department' }
  ];

  const styles = {
    card: {
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    title: {
      margin: '0 0 8px 0',
      fontSize: '16px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    content: {
      margin: '0 0 16px 0',
      fontSize: '13px',
      color: '#475569',
      lineHeight: '1.6'
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '11px',
      color: '#94a3b8',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '12px'
    }
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
        Company-wide Announcements
      </h3>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
          <Megaphone size={32} style={{ margin: '0 auto 12px auto', display: 'block' }} />
          No announcements listed.
        </div>
      ) : (
        <div>
          {list.map(item => (
            <div key={item.id} style={styles.card}>
              <h4 style={styles.title}>
                <Megaphone size={16} color="#a855f7" />
                {item.title}
              </h4>
              <p style={styles.content}>{item.content}</p>
              
              <div style={styles.footer}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> Published on: {item.date}
                </span>
                <span>By: {item.author}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
