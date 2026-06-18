import React, { useState, useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { attendanceService } from '../services/attendanceService';
import { Clock, Play, Square, Target, Calendar, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { isClockedIn, punches, elapsedTime, clockIn, clockOut, status } = useAttendance();
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatedLocation, setSimulatedLocation] = useState('Office');

  const shift = attendanceService.getShiftDetails();
  const SHIFT_DURATION = 7.5 * 3600; // 7.5 hours target in seconds

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await attendanceService.getLogs();
      if (res.success) {
        setAllLogs(res.data);
        setLogs(res.data.slice(0, 5)); // show latest 5 logs
      }
      setIsLoading(false);
    };
    fetchLogs();
  }, [isClockedIn]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAction = async () => {
    if (isClockedIn) {
      await clockOut();
    } else {
      await clockIn(simulatedLocation);
    }
  };

  // Calculate month stats dynamically
  const presentCount = allLogs.filter(l => l.status === 'Present' || l.status === 'Late' || l.status === 'Half Day').length;
  const lateCount = allLogs.filter(l => l.status === 'Late').length;
  const absentCount = allLogs.filter(l => l.status === 'Absent').length;
  const leaveCount = allLogs.filter(l => l.status === 'On Leave').length;
  const holidayCount = 8; // default holidays count
  const onTimePercentage = presentCount > 0 
    ? Math.round(((presentCount - lateCount) / presentCount) * 100) 
    : 100;

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Prepare chart data dynamically from logs (latest 7 days of logs)
  const todayStr = new Date().toISOString().split('T')[0];
  const chartData = allLogs.slice(0, 7).reverse().map(l => ({
    day: l.date === todayStr ? 'Today' : new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: l.activeHours
  }));

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    clockTitle: {
      margin: '0 0 16px 0',
      fontSize: '18px',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    timerText: {
      fontSize: '48px',
      fontWeight: '800',
      color: '#0f172a',
      margin: '16px 0',
      letterSpacing: '-1px',
      fontFamily: 'monospace'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '14px',
      background: '#fff',
      outline: 'none',
      cursor: 'pointer'
    },
    punchItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
      color: '#334155'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '20px'
    },
    statBox: {
      background: '#f8fafc',
      padding: '12px',
      borderRadius: '12px',
      textAlign: 'center',
      border: '1px solid #f1f5f9'
    },
    statValue: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a'
    },
    statLabel: {
      fontSize: '11px',
      color: '#64748b',
      marginTop: '4px'
    }
  };

  return (
    <div>
      <div style={styles.grid}>
        {/* Interactive Check-In/Out Card */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={styles.clockTitle}>
              <Clock size={20} color="#0ea5e9" />
              Timing Card
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={14} color="#64748b" /> Target: 07:30:00
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={styles.timerText}>
              {formatTime(elapsedTime)}
            </div>
            
            {/* Progress bar */}
            <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', margin: '0 0 24px 0', overflow: 'hidden' }}>
              <div style={{ 
                background: isClockedIn ? '#0ea5e9' : '#cbd5e1', 
                height: '100%', 
                width: `${Math.min((elapsedTime / SHIFT_DURATION) * 100, 100)}%`,
                transition: 'width 0.5s ease'
              }} />
            </div>

            {/* Simulated Location Check */}
            {!isClockedIn && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Work Location:</span>
                <select 
                  style={styles.select} 
                  value={simulatedLocation} 
                  onChange={(e) => setSimulatedLocation(e.target.value)}
                >
                  <option value="Office">Office Geofence</option>
                  <option value="Home">Work From Home</option>
                  <option value="Client Site">Client Site</option>
                </select>
              </div>
            )}

            {isClockedIn && (
              <p style={{ color: '#0ea5e9', fontSize: '13px', fontWeight: '500', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Info size={14} /> Currently clocked in via {punches[punches.length - 1]?.location}
              </p>
            )}

            <button 
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '12px', 
                border: 'none', 
                background: isClockedIn ? '#ef4444' : '#22c55e', 
                color: 'white', 
                fontWeight: '700', 
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                boxShadow: isClockedIn ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(34, 197, 94, 0.2)'
              }}
              onClick={handleAction}
            >
              {isClockedIn ? (
                <>
                  <Square size={18} fill="white" /> Check Out
                </>
              ) : (
                <>
                  <Play size={18} fill="white" /> Check In
                </>
              )}
            </button>
          </div>
        </div>

        {/* Today's Punch Logs & Shift Rules */}
        <div style={styles.card}>
          <h3 style={styles.clockTitle}>
            <Calendar size={20} color="#0ea5e9" />
            Today's Punches
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', height: '120px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '16px' }}>
            {punches.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '16px' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                No punches registered today.
              </div>
            ) : (
              punches.map((p, idx) => (
                <div key={idx} style={styles.punchItem}>
                  <span><strong>Punch {idx + 1}</strong>: {p.in}</span>
                  <span style={{ color: '#64748b' }}>({p.location})</span>
                  <span>Out: {p.out}</span>
                </div>
              ))
            )}
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#1e293b' }}>Shift Rules:</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
              <span>Shift: {shift.timings}</span>
              <span>Break: {shift.breakDuration.split(' ')[0]} Hr</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Weekly Trend Chart */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <h3 style={styles.clockTitle}>
            <TrendingUp size={20} color="#0ea5e9" />
            Weekly Work Hours
          </h3>
          
          <div style={{ width: '100%', height: '220px', marginTop: '16px' }}>
            {chartData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', paddingTop: '60px' }}>No history log data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Month Metrics Summary */}
        <div style={styles.card}>
          <h3 style={styles.clockTitle}>
            <Calendar size={20} color="#0ea5e9" />
            {currentMonthName} Summary
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>Overview of your monthly calculations</p>

          <div style={styles.statsContainer}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{presentCount}</div>
              <div style={styles.statLabel}>Present</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: '#eab308' }}>{lateCount}</div>
              <div style={styles.statLabel}>Late</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: '#ef4444' }}>{absentCount}</div>
              <div style={styles.statLabel}>Absent</div>
            </div>
          </div>

          <div style={styles.statsContainer}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{leaveCount}</div>
              <div style={styles.statLabel}>Leaves</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{holidayCount}</div>
              <div style={styles.statLabel}>Holidays</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: '#22c55e' }}>{onTimePercentage}%</div>
              <div style={styles.statLabel}>On-Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
