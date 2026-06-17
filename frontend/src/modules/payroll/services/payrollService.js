import axios from 'axios';

export const payrollService = {
  getSalaryStructure: async (employeeId = 'EMP-001') => {
    try {
      const response = await axios.get(`/api/payroll/structure/${employeeId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch salary structure' };
    }
  },

  getPayslips: async (employeeId = 'EMP-001') => {
    try {
      const response = await axios.get(`/api/payroll/payslips/${employeeId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch payslips' };
    }
  },

  runPayroll: async (monthData) => {
    try {
      const response = await axios.post('/api/payroll/run', monthData);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to run payroll' };
    }
  }
};
export default payrollService;