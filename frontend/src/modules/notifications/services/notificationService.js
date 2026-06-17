import axios from 'axios';

export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await axios.get('/api/notifications');
      return response.data;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return { success: false, data: [] };
    }
  },

  markAllRead: async () => {
    try {
      const response = await axios.put('/api/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return { success: false };
    }
  },

  markRead: async (id) => {
    try {
      const response = await axios.put(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false };
    }
  }
};
export default notificationService;
