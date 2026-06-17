import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

export const WorkHourCard = () => {
  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [sessionStatus, setSessionStatus] = useState('Dormant Matrix');

  const syncCardTelemetry = async () => {
    const cachedStatus = localStorage.getItem('active_session_status');
    
    // Check-out hote hi calculation and interval tracking stop karo
    if (cachedStatus === 'CheckedOut') {
      setShiftSeconds(0);
      setSessionStatus('Dormant Matrix');
      return;
    }

    try {
      const history = await attendanceService.getAttendanceHistory();
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLog = history.find(l => l.date === todayStr);

      // Agar check-in ho chuka hai aur check-out nahi hua hai, toh timer chalao
      if (todayLog && todayLog.checkIn && !todayLog.checkOut) {
        const startTime = new Date(`${todayStr}T${todayLog.checkIn}`);
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        
        setShiftSeconds(elapsed > 0 ? elapsed : 0);
        setSessionStatus('Active Run');
        localStorage.setItem('active_session_status', 'Present');
      } else {
        setShiftSeconds(0);
        setSessionStatus('Dormant Matrix');
        localStorage.setItem('active_session_status', 'CheckedOut');
      }
    } catch (err) {
      setShiftSeconds(0);
      setSessionStatus('Dormant Matrix');
    }
  };

  useEffect(() => {
    syncCardTelemetry();

    // Jab doosre modules (CheckIn/CheckOut) se storage change ho, toh sync karo
    const handleStorageBreak = () => {
      syncCardTelemetry();
    };
    window.addEventListener('storage', handleStorageBreak);

    // Live tracking ticker loop
    const runningTicker = setInterval(() => {
      const currentLocalStatus = localStorage.getItem('active_session_status');
      if (currentLocalStatus === 'Present') {
        setShiftSeconds((prev) => prev + 1);
        setSessionStatus('Active Run');
      } else {
        setSessionStatus('Dormant Matrix');
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageBreak);
      clearInterval(runningTicker);
    };
  }, []);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 text-white rounded-2xl p-5 shadow-sm">
      <p className="text-slate-400 text-[10px] tracking-wider uppercase font-semibold">Total Aggregated Effort Time</p>
      <h1 className="text-3xl font-mono font-bold my-2 tracking-tight">
        {formatTimer(shiftSeconds)} <span className="text-xs font-sans font-normal text-slate-500">HRS</span>
      </h1>
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/60 font-medium text-slate-400">
        <div>Target: <span className="text-slate-200 block font-bold">08:00 Hours</span></div>
        <div>Mode: <span className={`${sessionStatus === 'Active Run' ? 'text-emerald-400' : 'text-slate-400'} block font-bold`}>{sessionStatus}</span></div>
      </div>
    </div>
  );
};