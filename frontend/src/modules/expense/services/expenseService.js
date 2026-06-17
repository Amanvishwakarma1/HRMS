import axios from 'axios';

export const getExpenses = async () => {
  try {
    const response = await axios.get('/api/expenses');
    return response.data.data;
  } catch (error) {
    console.error('Failed to get expenses:', error);
    return [];
  }
};

export const submitExpense = async (expenseData) => {
  try {
    const response = await axios.post('/api/expenses', expenseData);
    return response.data.success;
  } catch (error) {
    console.error('Failed to submit expense:', error);
    return false;
  }
};

export const updateExpenseStatus = async (id, status) => {
  try {
    const response = await axios.put(`/api/expenses/${id}`, { status });
    return response.data.success;
  } catch (error) {
    console.error('Failed to update expense status:', error);
    return false;
  }
};