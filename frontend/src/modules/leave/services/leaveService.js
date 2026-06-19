import axios from 'axios';

export const leaveService = {
  getAllLeaves: async () => {
    try {
      const response = await axios.get('/api/leaves');
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch leave logs' };
    }
  },

  getPendingLeaves: async () => {
    try {
      const response = await axios.get('/api/leaves');
      if (response.data.success) {
        const pending = response.data.data.filter(l => l.status === 'Pending');
        return { success: true, data: pending };
      }
      return { success: false, message: 'Failed to filter pending requests' };
    } catch (error) {
      return { success: false, message: 'Failed to fetch pending requests' };
    }
  },

  applyLeave: async (leaveData) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser')) || { username: 'Current Employee' };
      const data = {
        ...leaveData,
        employeeName: user.username
      };
      const response = await axios.post('/api/leaves', data);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to submit leave request' };
    }
  },

  updateLeaveStatus: async (id, newStatus, rejectionReason = '', requestMessage = '') => {
    try {
      const response = await axios.put(`/api/leaves/${id}`, { 
        status: newStatus, 
        rejectionReason,
        requestMessage
      });
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to update leave status' };
    }
  }
};
export default leaveService;