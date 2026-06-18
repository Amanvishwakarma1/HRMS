import axios from 'axios';

export const payrollService = {
  // --- Salary Structures ---
  getSalaryStructures: async () => {
    const response = await axios.get('/api/salary-structures');
    return response.data;
  },

  getSalaryStructure: async (employeeId) => {
    const response = await axios.get(`/api/salary-structures/${employeeId}`);
    return response.data;
  },

  createSalaryStructure: async (data) => {
    const response = await axios.post('/api/salary-structures', data);
    return response.data;
  },

  updateSalaryStructure: async (id, data) => {
    const response = await axios.put(`/api/salary-structures/${id}`, data);
    return response.data;
  },

  deleteSalaryStructure: async (id) => {
    const response = await axios.delete(`/api/salary-structures/${id}`);
    return response.data;
  },

  cloneSalaryStructure: async (data) => {
    const response = await axios.post('/api/salary-structures/clone', data);
    return response.data;
  },

  getRevisionHistory: async (employeeId) => {
    const response = await axios.get(`/api/salary-structures/history/${employeeId}`);
    return response.data;
  },

  // --- Payroll Runs & Records ---
  runPayroll: async (month) => {
    const response = await axios.post('/api/payroll/run', { month });
    return response.data;
  },

  getPayrollRuns: async () => {
    const response = await axios.get('/api/payroll/runs');
    return response.data;
  },

  getPayrollRecords: async (runId) => {
    const response = await axios.get('/api/payroll/records', { params: { runId } });
    return response.data;
  },

  approvePayroll: async (id) => {
    const response = await axios.post('/api/payroll/approve', { id });
    return response.data;
  },

  markPaid: async (id) => {
    const response = await axios.post('/api/payroll/mark-paid', { id });
    return response.data;
  },

  reopenPayroll: async (id) => {
    const response = await axios.put(`/api/payroll/reopen/${id}`);
    return response.data;
  },

  // --- Bonuses ---
  getBonuses: async () => {
    const response = await axios.get('/api/bonuses');
    return response.data;
  },

  createBonus: async (data) => {
    const response = await axios.post('/api/bonuses', data);
    return response.data;
  },

  bulkAssignBonus: async (data) => {
    const response = await axios.post('/api/bonuses/bulk', data);
    return response.data;
  },

  approveBonus: async (id, status) => {
    const response = await axios.put(`/api/bonuses/${id}/approve`, { status });
    return response.data;
  },

  deleteBonus: async (id) => {
    const response = await axios.delete(`/api/bonuses/${id}`);
    return response.data;
  },

  // --- Reimbursements ---
  getReimbursements: async () => {
    const response = await axios.get('/api/reimbursements');
    return response.data;
  },

  createReimbursement: async (data) => {
    const response = await axios.post('/api/reimbursements', data);
    return response.data;
  },

  approveReimbursement: async (id, status) => {
    const response = await axios.put(`/api/reimbursements/${id}/approve`, { status });
    return response.data;
  },

  deleteReimbursement: async (id) => {
    const response = await axios.delete(`/api/reimbursements/${id}`);
    return response.data;
  },

  // --- Tax Declarations ---
  getTaxDeclarations: async () => {
    const response = await axios.get('/api/tax-declarations');
    return response.data;
  },

  createTaxDeclaration: async (data) => {
    const response = await axios.post('/api/tax-declarations', data);
    return response.data;
  },

  approveTaxDeclaration: async (id, status) => {
    const response = await axios.put(`/api/tax-declarations/${id}/approve`, { status });
    return response.data;
  },

  deleteTaxDeclaration: async (id) => {
    const response = await axios.delete(`/api/tax-declarations/${id}`);
    return response.data;
  },

  getTaxReport: async (employeeId, financialYear) => {
    const response = await axios.get('/api/tax-declarations/report', { params: { employeeId, financialYear } });
    return response.data;
  },

  // --- Audit Logs ---
  getAuditLogs: async () => {
    const response = await axios.get('/api/audit-logs');
    return response.data;
  },

  // --- Employees ---
  getEmployees: async () => {
    const response = await axios.get('/api/attendance/employees');
    return response.data;
  }
};

export default payrollService;