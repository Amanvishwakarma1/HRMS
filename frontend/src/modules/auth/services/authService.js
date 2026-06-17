import axios from 'axios';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check backend connection.'
      };
    }
  }
};
export default authService;
