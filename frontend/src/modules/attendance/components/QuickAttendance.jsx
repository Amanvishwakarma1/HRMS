import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Target } from 'lucide-react';

const QuickAttendance = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const SHIFT_DURATION = 7.5 * 3600; // 7.5 hours in seconds

  useEffect(() => {
    let interval;
    if (isClockedIn) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCheckOut = () => {
    setIsClockedIn(false);
    setElapsedTime(0);
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
          <Clock size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Attendance
        </h3>
        {/* Added Target Display */}
        <div style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Target size={12} /> Target: 07:30:00
        </div>
      </div>
      
      <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: '16px 0' }}>
        {formatTime(elapsedTime)}
      </div>
      
      <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', margin: '0 0 20px 0', overflow: 'hidden' }}>
        <div style={{ 
          background: isClockedIn ? '#0ea5e9' : '#cbd5e1', 
          height: '100%', 
          width: `${Math.min((elapsedTime / SHIFT_DURATION) * 100, 100)}%`,
          transition: 'width 0.5s ease'
        }} />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {!isClockedIn ? (
          <button 
            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#22c55e', color: 'white', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => setIsClockedIn(true)}
          >
            <Play size={18} fill="white" /> Check In
          </button>
        ) : (
          <button 
            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' }}
            onClick={handleCheckOut}
          >
            <Square size={18} fill="white" /> Check Out
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickAttendance;