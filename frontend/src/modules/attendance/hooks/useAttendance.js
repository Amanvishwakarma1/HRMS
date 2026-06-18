import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { geofenceService } from '../services/geofenceService';

export const useAttendance = () => {
  // Mock Mode States
  const [status, setStatus] = useState({
    isClockedIn: false,
    lastCheckInTime: null,
    accumulatedTime: 0,
    elapsedTime: 0,
    punches: [],
    date: new Date().toISOString().split('T')[0]
  });
  const [elapsedTime, setElapsedTime] = useState(0);

  // Postgres Mode States
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [officeConfig, setOfficeConfig] = useState({ lat: 28.6282, lng: 77.3898, radius: 200, officeName: 'Headquarters Alpha' });

  // Common States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeEmpId = localStorage.getItem('active_employee_id') || '2';

      if (!isNaN(activeEmpId)) {
        // Postgres Mode
        const empIdNum = Number(activeEmpId);
        
        // Load geofence config
        try {
          const geofence = await geofenceService.fetchOfficeLocation();
          if (geofence) setOfficeConfig(geofence);
        } catch (e) {
          console.error("Geofence load error:", e);
        }

        // Load attendance history
        const history = await attendanceService.getAttendanceHistory(empIdNum);
        setRecords(history);

        // Load today's check-in status
        const today = await attendanceService.getTodayStatus(empIdNum);
        setTodayRecord(today);
        
        if (today && !today.checkOut) {
          localStorage.setItem('is_checked_in', 'true');
          localStorage.setItem('today_check_in_time', today.checkIn ? new Date(today.checkIn).toLocaleTimeString() : '--:--:--');
        } else {
          localStorage.setItem('is_checked_in', 'false');
        }
      } else {
        // Mock Mode (String / Username based)
        const username = activeEmpId;
        const fresh = await attendanceService.getTodayStatus(username);
        setStatus(fresh);
        setElapsedTime(fresh.elapsedTime || 0);
      }
    } catch (err) {
      console.error("Error fetching attendance status:", err);
      setError(err.message || 'Error occurred querying attendance API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const handleGlobalSync = () => {
      console.log("Global sync event caught! Refreshing hook state...");
      fetchStatus();
    };

    window.addEventListener('storage', handleGlobalSync);
    window.addEventListener('attendance_update', handleGlobalSync);

    return () => {
      window.removeEventListener('storage', handleGlobalSync);
      window.removeEventListener('attendance_update', handleGlobalSync);
    };
  }, [fetchStatus]);

  // Live Timer for Mock Mode
  useEffect(() => {
    let interval = null;
    if (status.isClockedIn) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(status.elapsedTime || 0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.isClockedIn, status.elapsedTime]);

  // Mock Mode Action Handlers
  const clockIn = async (locationType = 'Office', lat, lng) => {
    setActionLoading(true);
    const res = await attendanceService.clockIn(locationType, lat, lng);
    if (res.success) {
      setStatus(res.data);
      setElapsedTime(res.data.elapsedTime || 0);
      window.dispatchEvent(new Event('attendance_update'));
    }
    setActionLoading(false);
    return res;
  };

  const clockOut = async () => {
    setActionLoading(true);
    const res = await attendanceService.clockOut();
    if (res.success) {
      setStatus(res.data);
      setElapsedTime(res.data.elapsedTime || 0);
      window.dispatchEvent(new Event('attendance_update'));
    }
    setActionLoading(false);
    return res;
  };

  // Postgres Mode Action Handlers
  const executeCheckIn = async (customLoc) => {
    setActionLoading(true);
    setError(null);
    try {
      const activeEmpId = Number(localStorage.getItem('active_employee_id') || '2');
      const loc = customLoc || { lat: officeConfig.lat, lng: officeConfig.lng };
      const res = await attendanceService.checkIn(loc, activeEmpId);
      
      localStorage.setItem('is_checked_in', 'true');
      window.dispatchEvent(new Event('attendance_update'));
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Check-in failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const executeCheckOut = async (customLoc) => {
    setActionLoading(true);
    setError(null);
    try {
      const activeEmpId = Number(localStorage.getItem('active_employee_id') || '2');
      const loc = customLoc || { lat: officeConfig.lat, lng: officeConfig.lng };
      const res = await attendanceService.checkOut(loc, activeEmpId);

      localStorage.setItem('is_checked_in', 'false');
      window.dispatchEvent(new Event('attendance_update'));
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Check-out failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    // Mock Mode Outputs
    isClockedIn: status.isClockedIn,
    punches: status.punches,
    elapsedTime,
    clockIn,
    clockOut,
    refreshStatus: fetchStatus,
    status,

    // Postgres Mode Outputs
    records,
    todayRecord,
    officeConfig,
    executeCheckIn,
    executeCheckOut,
    fetchStatus,
    refresh: fetchStatus,

    // Common
    loading,
    actionLoading,
    error
  };
};

export default useAttendance;
