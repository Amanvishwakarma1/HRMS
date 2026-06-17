import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
<<<<<<< HEAD
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Coffee } from 'lucide-react';

const AttendanceCalendar = () => {
  const [logs, setLogs] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 17)); // June 2026
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await attendanceService.getLogs();
      if (res.success) {
        setLogs(res.data);
      }
    };
    fetchLogs();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Holidays in June 2026 (mocked)
  const holidays = {
    '2026-06-05': 'World Environment Day',
    '2026-06-18': 'Mid-Year Holiday',
  };

  const getDayStatus = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const log = logs.find(l => l.date === dateStr);
    
    // Check if it's a holiday
    if (holidays[dateStr]) {
      return { status: 'Holiday', label: holidays[dateStr], color: '#38bdf8', bg: '#ecfeff', icon: 'H' };
    }

    // Check if it's a weekend
    const dateObj = new Date(year, month, dayNum);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayName === 'Saturday' || dayName === 'Sunday') {
      return { status: 'Week Off', label: 'Week Off', color: '#94a3b8', bg: '#f1f5f9', icon: 'WO' };
    }

    if (log) {
      if (log.status === 'Present') return { status: 'Present', checkIn: log.checkIn, checkOut: log.checkOut, color: '#22c55e', bg: '#f0fdf4', icon: 'P' };
      if (log.status === 'Late') return { status: 'Late', checkIn: log.checkIn, checkOut: log.checkOut, color: '#eab308', bg: '#fef9c3', icon: 'L' };
      if (log.status === 'Half Day') return { status: 'Half Day', checkIn: log.checkIn, checkOut: log.checkOut, color: '#f97316', bg: '#ffeff0', icon: 'HD' };
      if (log.status === 'On Leave') return { status: 'On Leave', color: '#a855f7', bg: '#faf5ff', icon: 'OL' };
      if (log.status === 'Absent') return { status: 'Absent', color: '#ef4444', bg: '#fef2f2', icon: 'A' };
    }

    // Fallback: If in the past and weekday, mark as Absent. If future, mark as Pending
    const today = new Date(2026, 5, 17);
    const cellDate = new Date(year, month, dayNum);
    if (cellDate < today) {
      return { status: 'Absent', label: 'Absent', color: '#ef4444', bg: '#fef2f2', icon: 'A' };
    } else {
      return { status: 'Upcoming', label: 'Upcoming', color: '#cbd5e1', bg: 'transparent', icon: '-' };
    }
  };

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    navButton: {
      border: '1px solid #e2e8f0',
      background: '#fff',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748b'
    },
    monthTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px'
    },
    weekdayHeader: {
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '12px',
      color: '#64748b',
      padding: '10px 0',
      textTransform: 'uppercase'
    },
    cell: (dayStatus, isToday, isHovered) => ({
      height: '85px',
      borderRadius: '12px',
      border: isToday ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
      backgroundColor: dayStatus.bg,
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      cursor: dayStatus.status !== 'Upcoming' ? 'pointer' : 'default',
      boxShadow: isHovered ? '0 8px 16px -4px rgba(0,0,0,0.1)' : 'none',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      transition: 'all 0.2s ease',
      zIndex: isHovered ? 10 : 1
    }),
    cellNumber: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1e293b'
    },
    cellIcon: (color) => ({
      fontSize: '10px',
      fontWeight: '800',
      padding: '2px 6px',
      borderRadius: '6px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      color: color,
      alignSelf: 'flex-start',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }),
    tooltip: {
      position: 'absolute',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '180px',
      background: '#0f172a',
      color: '#ffffff',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
      fontSize: '12px',
      zIndex: 100,
      pointerEvents: 'none'
    },
    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid #e2e8f0',
      justifyContent: 'center'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#64748b'
    },
    legendDot: (bg) => ({
      width: '12px',
      height: '12px',
      borderRadius: '4px',
      background: bg
    })
  };

  const renderCells = () => {
    const cells = [];
    
    // Empty cells before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} style={{ height: '85px' }} />);
    }

    // Days in month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStatus = getDayStatus(d);
      const isToday = d === 17 && month === 5 && year === 2026; // June 17, 2026 is today
      const isHovered = hoveredDay === d;

      cells.push(
        <div
          key={`day-${d}`}
          style={styles.cell(dayStatus, isToday, isHovered)}
          onMouseEnter={() => dayStatus.status !== 'Upcoming' && setHoveredDay(d)}
          onMouseLeave={() => setHoveredDay(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={styles.cellNumber}>{d}</span>
            {isToday && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ea5e9' }} />}
          </div>

          {dayStatus.icon !== '-' && (
            <span style={styles.cellIcon(dayStatus.color)}>{dayStatus.icon}</span>
          )}

          {/* Tooltip detail */}
          {isHovered && dayStatus.status !== 'Upcoming' && (
            <div style={styles.tooltip}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                June {d}, 2026
              </p>
              <p style={{ margin: '3px 0' }}>Status: <strong>{dayStatus.status}</strong></p>
              {dayStatus.checkIn && (
                <>
                  <p style={{ margin: '3px 0' }}>In: {dayStatus.checkIn}</p>
                  <p style={{ margin: '3px 0' }}>Out: {dayStatus.checkOut}</p>
                </>
              )}
              {dayStatus.label && <p style={{ margin: '3px 0', color: '#38bdf8' }}>{dayStatus.label}</p>}
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.monthTitle}>
          <CalendarIcon size={20} color="#0ea5e9" />
          {monthNames[month]} {year}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={styles.navButton} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <ChevronLeft size={16} />
          </button>
          <button style={styles.navButton} onClick={() => setCurrentDate(new Date(2026, 5, 17))}>
            Today
          </button>
          <button style={styles.navButton} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {weekdays.map(w => (
          <div key={w} style={styles.weekdayHeader}>{w}</div>
        ))}
        {renderCells()}
      </div>

      {/* Legend bar */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#f0fdf4')} /> Present
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#fef9c3')} /> Late
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#ffeff0')} /> Half Day
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#faf5ff')} /> On Leave
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#fef2f2')} /> Absent
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#ecfeff')} /> Holiday
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#f1f5f9')} /> Week Off
=======
import { StatusBadge } from '../components/StatusBadge';

export const AttendanceCalendar = () => {
  const [logs, setLogs] = useState([]);
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(5); // June (0-indexed 5)

  useEffect(() => {
    attendanceService.getAttendanceHistory().then(setLogs);
  }, []);

  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const rawDaysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const pinpointDayLogAndEvaluate = (dayNum) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const matchedLog = logs.find(l => l.date === formattedDate);

    if (!matchedLog) return null;

    if (matchedLog.checkIn && matchedLog.checkOut && matchedLog.checkOut !== '--:--:--') {
      const getParsedDate = (dateStr, timeVal) => {
        if (!timeVal) return null;
        if (String(timeVal).includes('T')) return new Date(timeVal);
        return new Date(`${dateStr}T${timeVal}`);
      };

      const start = getParsedDate(formattedDate, matchedLog.checkIn);
      const end = getParsedDate(formattedDate, matchedLog.checkOut);

      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          ...matchedLog,
          workingHours: null
        };
      }

      const computedHours = (end - start) / (1000 * 60 * 60);

      // Core rule evaluation structure criteria logic
      let finalCalculatedStatus = 'Absent';
      if (computedHours >= 7) {
        finalCalculatedStatus = 'Present';
      } else {
        finalCalculatedStatus = 'Late'; // Under 7 hours threshold maps to late status badge layout
      }

      return {
        ...matchedLog,
        status: finalCalculatedStatus,
        workingHours: computedHours.toFixed(1)
      };
    }

    return {
      ...matchedLog,
      workingHours: null
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Structural Matrix Calendar</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          High-level graphical view tracking compliance statuses for June 2026. Metrics: Present (&ge; 7 hrs) | Late (&lt; 7 hrs).
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-3 min-h-[350px]">
          <div className="bg-slate-50/30 rounded-xl border border-slate-100/50 p-2 opacity-30 text-xs text-slate-400">31</div>
          
          {rawDaysArray.map((day) => {
            const currentMatch = pinpointDayLogAndEvaluate(day);
            return (
              <div 
                key={day} 
                className={`rounded-xl border p-2 flex flex-col justify-between transition-all group hover:shadow-sm ${
                  currentMatch ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-800 transition-colors font-mono">{day}</span>
                  {currentMatch?.workingHours && (
                    <span className="text-[9px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {currentMatch.workingHours}h
                    </span>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  {currentMatch ? (
                    <StatusBadge status={currentMatch.status} />
                  ) : (
                    <span className="text-[10px] text-slate-300 font-medium font-mono">No Logs</span>
                  )}
                </div>
              </div>
            );
          })}
>>>>>>> 077d9bac6d2e1f9ec4139220792812a0a3ab0c43
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default AttendanceCalendar;
=======
};
>>>>>>> 077d9bac6d2e1f9ec4139220792812a0a3ab0c43
