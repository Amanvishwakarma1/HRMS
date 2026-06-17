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
