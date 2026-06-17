import React, { useState, useEffect } from 'react';

export const WorkHourCard = () => {
  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [sessionStatus, setSessionStatus] = useState('Dormant Matrix');

  const recalculateTimer = () => {
    const isCheckedIn = localStorage.getItem('is_checked_in') === 'true';
    const checkInTimeStr = localStorage.getItem('check_in_time_stamp');

    if (isCheckedIn && checkInTimeStr) {
      const startTime = new Date(checkInTimeStr);
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      
      setShiftSeconds(elapsed > 0 ? elapsed : 0);
      setSessionStatus('Active Run');
    } else {
      setShiftSeconds(0);
      setSessionStatus('Dormant Matrix');
    }
  };

  useEffect(() => {
    // Component mount hone par immediate sync karo
    recalculateTimer();

    // Jab dusre modules (CheckIn / CheckOut) se change aaye toh sync ho
    const handleGlobalStorageUpdate = () => {
      recalculateTimer();
    };
    window.addEventListener('storage', handleGlobalStorageUpdate);

    // Live Reactive Ticker Interval Loop
    const liveTicker = setInterval(() => {
      const isCheckedIn = localStorage.getItem('is_checked_in') === 'true';
      if (isCheckedIn) {
        setShiftSeconds((prev) => prev + 1);
        setSessionStatus('Active Run');
      } else {
        setShiftSeconds(0);
        setSessionStatus('Dormant Matrix');
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleGlobalStorageUpdate);
      clearInterval(liveTicker);
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