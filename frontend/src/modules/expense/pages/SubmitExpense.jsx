import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';

function SubmitExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const editExpenseData = location.state?.expense || null;
  
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (formData, status) => {
    setSubmitting(true);
    setNotification(null);
    try {
      let response;
      const payload = { ...formData, status };

      if (editExpenseData) {
        if (editExpenseData.status === 'Need Information') {
          // Resubmit clarification
          response = await axios.post(`/api/expenses/${editExpenseData.id}/resubmit`, payload);
        } else {
          // Edit standard draft
          response = await axios.put(`/api/expenses/${editExpenseData.id}`, payload);
        }
      } else {
        // Create new
        response = await axios.post('/api/expenses', payload);
      }

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: status === 'Submitted' 
            ? 'Your expense claim has been successfully submitted and routed for approval!' 
            : 'Expense draft saved successfully.'
        });
        
        // Wait 2.5s and redirect
        setTimeout(() => {
          navigate('/expenses');
        }, 2500);
      } else {
        setNotification({
          type: 'error',
          message: response.data.message || 'Operation failed.'
        });
      }
    } catch (err) {
      console.error('Submit expense error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'A network error occurred. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/expenses')}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {editExpenseData ? 'Edit Expense Claim' : 'Submit Expense Claim'}
            </h1>
            <p className="text-sm text-slate-500">
              {editExpenseData ? `Update details for Draft EXP-${editExpenseData.id}` : 'Fill out details to request company reimbursement.'}
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          } animate-[slideDown_0.3s_ease-out]`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</span>
              <span className="text-xs font-medium opacity-90">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-8">
        <ExpenseForm 
          onSubmit={handleSubmit} 
          initialData={editExpenseData}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}

export default SubmitExpense;