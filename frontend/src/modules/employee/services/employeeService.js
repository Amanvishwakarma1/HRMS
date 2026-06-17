import axios from 'axios';

export const employeeService = {
  getAllEmployees: async () => {
    try {
      const response = await axios.get('/api/employees');
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch employees' };
    }
  },

  addEmployee: async (employeeData) => {
    try {
      const response = await axios.post('/api/employees', employeeData);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to add employee' };
    }
  },

  getEmployeeById: async (id) => {
    try {
      const response = await axios.get(`/api/employees/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch employee details' };
    }
  },

  updateEmployee: async (id, updatedData) => {
    try {
      const response = await axios.put(`/api/employees/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to update employee' };
    }
  }
};
export default employeeService;