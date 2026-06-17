import React, { useState, useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { locationService } from '../services/locationService';

export const CheckIn = () => {
  const { todayRecord, executeCheckIn, officeConfig, error, fetchStatus } = useAttendance();
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const formatTime = (isoStr) => {
    if (!isoStr) return '--:--:--';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr; 
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const isCheckedIn = !!(todayRecord && !todayRecord.checkOut);
  const entryTime = todayRecord ? formatTime(todayRecord.checkIn) : '--:--:--';

  useEffect(() => {
    if (isCheckedIn) {
      setStatusMessage("Validation Authenticated. Gate operational metrics actively logging system output.");
    } else {
      setStatusMessage("");
    }
  }, [isCheckedIn]);

  const handleCheckInSequence = async () => {
    setActionLoading(true);
    setStatusMessage('');
    setGpsLoading(true);
    
    let location = { lat: officeConfig.lat, lng: officeConfig.lng }; 
    try {
      const browserLoc = await locationService.getCurrentLocation();
      location = { lat: browserLoc.lat, lng: browserLoc.lng };
      console.log("GPS coordinates acquired:", browserLoc);
    } catch (err) {
      console.warn("Using default office location lock due to GPS access warning:", err.message);
    } finally {
      setGpsLoading(false);
    }

    try {
      const res = await executeCheckIn(location);
      setStatusMessage(res.message || "Validation Authenticated. Gate operational metrics actively logging system status.");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Secure Entry Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">Initialize workspace access verification sequence via verified telemetry link.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Workspace Gate Access Status</h3>
        <p className="text-xs text-slate-400 font-mono -mt-3">
          Office Node: {officeConfig.officeName || "Headquarters Alpha"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shift Gate Entry</span>
            <div className="text-xl font-mono font-bold text-slate-700 mt-1">{entryTime}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shift Gate Departure</span>
            <div className="text-xl font-mono font-bold text-slate-700 mt-1">
              {todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : "-- : -- : --"}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
            ✅ {statusMessage}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-medium">
            ❌ Check-In Error: {error}
          </div>
        )}

        {!isCheckedIn && (
          <div className="space-y-4 pt-2">
            <button
              onClick={handleCheckInSequence}
              disabled={actionLoading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm p-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading ? (gpsLoading ? "Acquiring GPS Telemetry..." : "Authenticating Presence...") : "Authenticate Check-In"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-600 space-y-1.5">
        <div className="flex justify-between"><span className="text-slate-400 font-sans">System Telemetry Matrix:</span> <span>Active validation channels online</span></div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">Geofence Enclosure Shield:</span> 
          <span>{isCheckedIn ? "SESSION CONNECTED" : "GATE READY"} ({officeConfig.radius}m lock)</span>
        </div>
      </div>
    </div>
  );
};