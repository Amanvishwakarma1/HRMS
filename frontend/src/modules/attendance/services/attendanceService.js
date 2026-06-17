import axios from 'axios';

<<<<<<< HEAD
const defaultShift = {
  name: "General Shift",
  code: "GS-0900",
  timings: "09:00 AM - 06:30 PM",
  breakDuration: "1 Hour (01:00 PM - 02:00 PM)",
  workDuration: "8.5 Hours",
  flexiTime: "Allowed (30 mins grace)",
  weeklyOff: ["Saturday", "Sunday"]
};

const getUsername = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  return user ? user.username : 'employee';
};

export const attendanceService = {
  getShiftDetails: () => defaultShift,

  getTodayStatus: async () => {
    try {
      const username = getUsername();
      const response = await axios.get(`/api/attendance/status/${username}`);
      return response.data.data;
    } catch (error) {
      // Return a dummy status on failure
      return {
        isClockedIn: false,
        lastCheckInTime: null,
        accumulatedTime: 0,
        elapsedTime: 0,
        punches: [],
        date: new Date().toISOString().split('T')[0]
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
  }
};
export default attendanceService;
=======
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
>>>>>>> 077d9bac6d2e1f9ec4139220792812a0a3ab0c43
