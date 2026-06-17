import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { geofenceService } from '../services/geofenceService';

export const useAttendance = () => {
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [officeConfig, setOfficeConfig] = useState({ lat: 28.6282, lng: 77.3898, radius: 200, officeName: 'Headquarters Alpha' });

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeEmpId = Number(localStorage.getItem('active_employee_id') || '2');
      
      // Load geofence config from locations table
      const geofence = await geofenceService.fetchOfficeLocation();
      setOfficeConfig(geofence);

      // Load attendance history for active employee
      const history = await attendanceService.getAttendanceHistory(activeEmpId);
      setRecords(history);

      // Load today's check-in status
      const today = await attendanceService.getTodayStatus(activeEmpId);
      setTodayRecord(today);
      
      // Update check in localStorage flag
      if (today && !today.checkOut) {
        localStorage.setItem('is_checked_in', 'true');
        localStorage.setItem('today_check_in_time', today.checkIn ? new Date(today.checkIn).toLocaleTimeString() : '--:--:--');
      } else {
        localStorage.setItem('is_checked_in', 'false');
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
    records,
    todayRecord,
    officeConfig,
    loading,
    actionLoading,
    error,
    executeCheckIn,
    executeCheckOut,
    fetchStatus,
    refresh: fetchStatus
  };
};