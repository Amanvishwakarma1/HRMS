import React, { useState, useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { locationService } from '../services/locationService';

export const CheckOut = () => {
  const { todayRecord, executeCheckOut, officeConfig, error, loading, actionLoading } = useAttendance();

  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [isInside, setIsInside] = useState(true);
  const [alertNotification, setAlertNotification] = useState("");
  const [currentDistance, setCurrentDistance] = useState(0); 

  const officeLat = officeConfig?.lat || 28.6282;
  const officeLong = officeConfig?.lng || 77.3898;
  const allowedRadius = officeConfig?.radius || 200;

  const formatTimeStr = (isoStr) => {
    if (!isoStr) return '--:--:--';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr; 
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const isTimerRunning = !!(todayRecord && !todayRecord.checkOut);

  // Dynamic Shift Seconds Counter
  useEffect(() => {
    if (!isTimerRunning || !todayRecord?.checkIn) {
      setShiftSeconds(0);
      return;
    }

    const startTime = new Date(todayRecord.checkIn);

    const trackingTimer = setInterval(() => {
      const elapsed = Math.floor((new Date() - startTime) / 1000);
      setShiftSeconds(elapsed > 0 ? elapsed : 0);

      // Perform geofence verification
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;

          const R = 6371000; // meters
          const dLat = (uLat - officeLat) * Math.PI / 180;
          const dLng = (uLng - officeLong) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(officeLat * Math.PI / 180) * Math.cos(uLat * Math.PI / 180) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          
          setCurrentDistance(distance);

          if (distance > allowedRadius) {
            setIsInside(false);
            setAlertNotification(`⚠️ Outside boundary limits (${Math.round(distance)}m away). Effort tracking suspended temporarily.`);
          } else {
            setIsInside(true);
            setAlertNotification("");
          }
        },
        (err) => console.log("GPS validation polling..."),
        { enableHighAccuracy: true }
      );
    }, 1000);

    return () => clearInterval(trackingTimer);
  }, [isTimerRunning, todayRecord, officeLat, officeLong, allowedRadius]);

  const handleSecureCheckOut = async () => {
    let location = { lat: officeLat, lng: officeLong };
    try {
      const pos = await locationService.getCurrentLocation();
      location = { lat: pos.lat, lng: pos.lng };
    } catch (e) {
      console.warn("Using default office coordinates lock for check-out due to location permissions:", e.message);
    }

    try {
      await executeCheckOut(location);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-slate-500 text-sm font-medium">
        Syncing Secure Telemetry Dashboard Interface Core...
      </div>
    );
  }

  const isCompleted = todayRecord && todayRecord.checkOut;

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Secure Departure Verification</h2>
        <p className="text-xs text-slate-400 mt-1">Conclude operational work window and decouple from live physical network boundaries.</p>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center shadow-lg">
        <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Total Aggregated Effort Time</p>
        <h1 className="text-5xl font-mono font-bold my-3 tracking-tight">
          {!isTimerRunning ? "00:00:00" : formatTimer(shiftSeconds)} <span className="text-sm font-sans font-normal text-slate-400">HRS</span>
        </h1>
        <div className="flex justify-between text-xs text-slate-300 pt-3 border-t border-slate-800 mt-3 font-medium">
          <span>Perimeter status: <b className={isCompleted ? "text-blue-400" : isTimerRunning ? (isInside ? "text-emerald-400" : "text-rose-400 animate-pulse") : "text-slate-400"}>
            {isCompleted ? "SESSION TERMINATED" : isTimerRunning ? (isInside ? "IN-OFFICE (RUNNING)" : "OUT OF BOUNDS (PAUSED)") : "AWAY (PAUSED)"}
          </b></span>
          <span>Allowed radius: <b className="text-slate-300">{allowedRadius}m</b></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shift Gate Entry</span>
          <div className="text-xl font-mono font-bold text-slate-700 mt-1">
            {todayRecord ? formatTimeStr(todayRecord.checkIn) : '--:--:--'}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shift Gate Departure</span>
          <div className="text-xl font-mono font-bold text-slate-700 mt-1">
            {todayRecord?.checkOut ? formatTimeStr(todayRecord.checkOut) : '--:--:--'}
          </div>
        </div>
      </div>

      {alertNotification && isTimerRunning && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
          {alertNotification}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-medium">
          ❌ Check-Out Error: {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Structural Sign-Off Matrix</h3>
        
        {isCompleted || !todayRecord ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-4 font-semibold text-center">
            {isCompleted 
              ? "🎉 Departure verification protocol completed. Operational tracking streams safely saved into database!" 
              : "⚠️ No active check-in record located for today. Check in first to enable checkout sign-off."}
          </div>
        ) : (
          <button
            onClick={handleSecureCheckOut}
            disabled={actionLoading || !isTimerRunning}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all shadow-sm"
          >
            {actionLoading ? "Processing Core Database Signoff Mutation..." : "Deauthenticate Check-Out"}
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-600 space-y-1.5">
        <div className="flex justify-between"><span className="text-slate-400 font-sans">Active Target Node ID:</span> <span>{todayRecord?.employeeId || localStorage.getItem('active_employee_id')}</span></div>
        <div className="flex justify-between"><span className="text-slate-400 font-sans">Current Geofence Distance:</span> <span>{Math.round(currentDistance)} meters</span></div>
        <div className="flex justify-between"><span className="text-slate-400 font-sans">Allowed Safe Radius:</span> <span>{allowedRadius} meters</span></div>
      </div>
    </div>
  );
};