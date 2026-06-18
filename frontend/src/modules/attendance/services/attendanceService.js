import axios from 'axios';

const defaultShift = {
  name: "General Shift",
  code: "GS-0900",
  timings: "09:00 AM - 06:30 PM",
  breakDuration: "1 Hour (01:00 PM - 02:00 PM)",
  workDuration: "8.5 Hours",
  flexiTime: "Allowed (30 mins grace)",
  weeklyOff: ["Saturday", "Sunday"]
};

const defaultShifts = [
  { id: 'S1', name: 'Standard Morning Shift', startTime: '09:00', endTime: '17:00', active: true },
  { id: 'S2', name: 'Evening Operation Window', startTime: '17:00', endTime: '01:00', active: false },
  { id: 'S3', name: 'Global Support Rotation', startTime: '22:00', endTime: '06:00', active: false }
];

const SHIFT_CONFIG_KEY = 'attendance_shift_manifest';

const getUsername = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  return user ? user.username : 'employee';
};

export const attendanceService = {
  getShiftDetails: () => defaultShift,

  getTodayStatus: async (empId) => {
    const activeEmpId = empId || localStorage.getItem('active_employee_id') || '2';
    
    const formatTimeStr = (isoStr) => {
      if (!isoStr) return '--:--:--';
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr; 
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    if (!isNaN(activeEmpId)) {
      try {
        const employeeId = Number(activeEmpId);
        const res = await axios.get(`http://localhost:5000/api/attendance/history/${employeeId}`);
        if (res.data && res.data.success) {
          const todayStr = new Date().toISOString().split('T')[0];
          const todayRecords = res.data.data.filter(r => {
            const checkInDate = new Date(r.check_in_time).toISOString().split('T')[0];
            return checkInDate === todayStr;
          });
          
          let completedAccumulated = 0;
          todayRecords.forEach(r => {
            if (r.check_in_time && r.check_out_time) {
              completedAccumulated += Math.floor((new Date(r.check_out_time) - new Date(r.check_in_time)) / 1000);
            }
          });

          const activeRecord = todayRecords.find(r => !r.check_out_time);
          const latestRecord = todayRecords[0];

          if (activeRecord) {
            return {
              id: activeRecord.id,
              employeeId: activeRecord.employee_id,
              checkIn: activeRecord.check_in_time,
              checkOut: null,
              checkInStr: formatTimeStr(activeRecord.check_in_time),
              checkOutStr: '--:--:--',
              status: activeRecord.status,
              latIn: activeRecord.latitude,
              lngIn: activeRecord.longitude,
              accumulatedTime: completedAccumulated,
              isClockedIn: true
            };
          } else if (latestRecord) {
            return {
              id: latestRecord.id,
              employeeId: latestRecord.employee_id,
              checkIn: latestRecord.check_in_time,
              checkOut: latestRecord.check_out_time,
              checkInStr: formatTimeStr(latestRecord.check_in_time),
              checkOutStr: formatTimeStr(latestRecord.check_out_time),
              status: latestRecord.status,
              latIn: latestRecord.latitude,
              lngIn: latestRecord.longitude,
              accumulatedTime: completedAccumulated,
              isClockedIn: false
            };
          }
        }
      } catch (err) {
        console.error("Error fetching today status from API:", err);
      }
    }

    try {
      const username = typeof activeEmpId === 'string' && isNaN(activeEmpId) 
        ? activeEmpId 
        : getUsername();
      const response = await axios.get(`/api/attendance/status/${username}`);
      const mockData = response.data.data;
      const lastPunch = mockData.punches.length > 0 ? mockData.punches[mockData.punches.length - 1] : null;
      return {
        id: username,
        employeeId: username,
        checkIn: mockData.lastCheckInTime ? new Date(mockData.lastCheckInTime).toISOString() : null,
        checkOut: mockData.isClockedIn ? null : (lastPunch && lastPunch.out !== '--' ? new Date().toISOString() : null),
        checkInStr: lastPunch ? lastPunch.in : '--:--:--',
        checkOutStr: lastPunch ? lastPunch.out : '--:--:--',
        status: 'Present',
        accumulatedTime: mockData.accumulatedTime || 0,
        isClockedIn: mockData.isClockedIn
      };
    } catch (error) {
      return {
        id: 'mock',
        employeeId: 'mock',
        checkIn: null,
        checkOut: null,
        checkInStr: '--:--:--',
        checkOutStr: '--:--:--',
        status: 'Absent',
        accumulatedTime: 0,
        isClockedIn: false
      };
    }
  },

  clockIn: async (locationType = 'Office', lat, lng) => {
    try {
      const username = getUsername();
      const response = await axios.post('/api/attendance/clock-in', {
        username,
        location: locationType,
        lat,
        lng
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clock in'
      };
    }
  },

  clockOut: async () => {
    try {
      const username = getUsername();
      const response = await axios.post('/api/attendance/clock-out', {
        username
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clock out'
      };
    }
  },

  getLogs: async () => {
    try {
      const username = getUsername();
      const response = await axios.get(`/api/attendance/logs/${username}`);
      return response.data;
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getRegularizations: async () => {
    try {
      const response = await axios.get('/api/attendance/regularizations');
      return response.data;
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  submitRegularization: async (reqData) => {
    try {
      const response = await axios.post('/api/attendance/regularizations', reqData);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to submit regularization' };
    }
  },

  updateRegularizationStatus: async (id, newStatus) => {
    try {
      const response = await axios.put(`/api/attendance/regularizations/${id}`, {
        status: newStatus
      });
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to update regularization request' };
    }
  },

  // Postgres-backed specific endpoints
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
      bypassShiftCheck: true
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

  getAllAttendance: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/all');
      if (res.data && res.data.success) {
        return res.data.data;
      }
    } catch (err) {
      console.error("Error fetching all attendance history from API:", err);
    }
    return [];
  },

  getEmployees: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/employees');
      if (res.data && res.data.success) {
        return res.data.data;
      }
    } catch (err) {
      console.error("Error fetching employees from API:", err);
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

export default attendanceService;
