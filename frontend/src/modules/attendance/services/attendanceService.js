import axios from 'axios';

const SHIFT_CONFIG_KEY = 'attendance_shift_manifest';

const defaultShifts = [
  { id: 'S1', name: 'Standard Morning Shift', startTime: '09:00', endTime: '17:00', active: true },
  { id: 'S2', name: 'Evening Operation Window', startTime: '17:00', endTime: '01:00', active: false },
  { id: 'S3', name: 'Global Support Rotation', startTime: '22:00', endTime: '06:00', active: false }
];

export const attendanceService = {
  getTodayStatus: async (empId) => {
    const employeeId = empId || Number(localStorage.getItem('active_employee_id') || '2');
    try {
      const res = await axios.get(`http://localhost:5000/api/attendance/history/${employeeId}`);
      if (res.data && res.data.success && res.data.data.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        // Find if there's any record for today that hasn't checked out yet
        const todayRecords = res.data.data.filter(r => {
          const checkInDate = new Date(r.check_in_time).toISOString().split('T')[0];
          return checkInDate === todayStr;
        });
        
        const activeRecord = todayRecords.find(r => !r.check_out_time);
        const latestRecord = todayRecords[0]; // ordered by check_in_time DESC

        if (activeRecord) {
          return {
            id: activeRecord.id,
            employeeId: activeRecord.employee_id,
            checkIn: activeRecord.check_in_time,
            checkOut: null,
            status: activeRecord.status,
            latIn: activeRecord.latitude,
            lngIn: activeRecord.longitude
          };
        } else if (latestRecord) {
          return {
            id: latestRecord.id,
            employeeId: latestRecord.employee_id,
            checkIn: latestRecord.check_in_time,
            checkOut: latestRecord.check_out_time,
            status: latestRecord.status,
            latIn: latestRecord.latitude,
            lngIn: latestRecord.longitude
          };
        }
      }
    } catch (err) {
      console.error("Error fetching today status from API:", err);
    }
    return null;
  },

  checkIn: async (location, empId) => {
    const employeeId = empId || Number(localStorage.getItem('active_employee_id') || '2');
    const payload = {
      employeeId,
      latitude: location.lat,
      longitude: location.lng
    };
    const res = await axios.post('http://localhost:5000/api/attendance/checkin', payload);
    return res.data;
  },

  checkOut: async (location, empId) => {
    const employeeId = empId || Number(localStorage.getItem('active_employee_id') || '2');
    const payload = {
      employeeId,
      latitude: location.lat,
      longitude: location.lng,
      accumulatedOutsideMinutes: 0,
      bypassShiftCheck: true // Enable seamless check-out testing in development
    };
    const res = await axios.post('http://localhost:5000/api/attendance/checkout', payload);
    return res.data;
  },

  getAttendanceHistory: async (empId) => {
    const employeeId = empId || Number(localStorage.getItem('active_employee_id') || '2');
    try {
      const res = await axios.get(`http://localhost:5000/api/attendance/history/${employeeId}`);
      if (res.data && res.data.success) {
        return res.data.data.map(r => ({
          id: r.id,
          date: new Date(r.check_in_time).toISOString().split('T')[0],
          checkIn: r.check_in_time,
          checkOut: r.check_out_time,
          latIn: r.latitude,
          lngIn: r.longitude,
          status: r.status
        }));
      }
    } catch (err) {
      console.error("Error fetching attendance history from API:", err);
    }
    return [];
  },

  getShifts: async () => {
    const cached = localStorage.getItem(SHIFT_CONFIG_KEY);
    if (!cached) {
      localStorage.setItem(SHIFT_CONFIG_KEY, JSON.stringify(defaultShifts));
      return defaultShifts;
    }
    return JSON.parse(cached);
  },

  updateShifts: async (updatedShifts) => {
    localStorage.setItem(SHIFT_CONFIG_KEY, JSON.stringify(updatedShifts));
    return updatedShifts;
  }
};