import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

export const useAttendance = () => {
  const [status, setStatus] = useState({
    isClockedIn: false,
    lastCheckInTime: null,
    accumulatedTime: 0,
    elapsedTime: 0,
    punches: [],
    date: new Date().toISOString().split('T')[0]
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    const fresh = await attendanceService.getTodayStatus();
    setStatus(fresh);
    setElapsedTime(fresh.elapsedTime);
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    let interval = null;
    if (status.isClockedIn) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(status.elapsedTime);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.isClockedIn, status.elapsedTime]);

  const clockIn = async (locationType = 'Office', lat, lng) => {
    const res = await attendanceService.clockIn(locationType, lat, lng);
    if (res.success) {
      setStatus(res.data);
      setElapsedTime(res.data.elapsedTime);
    }
    return res;
  };

  const clockOut = async () => {
    const res = await attendanceService.clockOut();
    if (res.success) {
      setStatus(res.data);
      setElapsedTime(res.data.elapsedTime);
    }
    return res;
  };

  return {
    isClockedIn: status.isClockedIn,
    punches: status.punches,
    elapsedTime,
    clockIn,
    clockOut,
    refreshStatus: loadStatus,
    status,
    loading
  };
};
export default useAttendance;
