import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
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
        </div>
      </div>
    </div>
  );
};