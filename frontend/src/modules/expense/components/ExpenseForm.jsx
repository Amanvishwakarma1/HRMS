import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, DollarSign, Tag, FileText, Briefcase, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import ReceiptUpload from './ReceiptUpload';

function ExpenseForm({ onSubmit, initialData = null, isSubmitting = false }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    currency: 'INR',
    project: '',
    description: '',
    paymentMethod: 'Personal Card',
    location: '',
    receiptId: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});

  // Fallback categories in case API fails
  const fallbackCategories = [
    { id: 1, name: 'Travel', limitAmount: 15000 },
    { id: 2, name: 'Food & Meals', limitAmount: 5000 },
    { id: 3, name: 'Fuel', limitAmount: 8000 },
    { id: 4, name: 'Accommodation', limitAmount: 20000 },
    { id: 5, name: 'Internet Bill', limitAmount: 2000 },
    { id: 6, name: 'Mobile Bill', limitAmount: 1500 },
    { id: 7, name: 'Office Supplies', limitAmount: 10000 },
    { id: 8, name: 'Client Meeting', limitAmount: 12000 },
    { id: 9, name: 'Miscellaneous', limitAmount: 0 }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/expenses/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories(fallbackCategories);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors for that field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReceiptUpload = (receiptId) => {
    setFormData(prev => ({
      ...prev,
      receiptId: receiptId
    }));
  };

  const handleReceiptClear = () => {
    setFormData(prev => ({
      ...prev,
      receiptId: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Date is required';
    } else {
      const selectedDate = new Date(formData.expenseDate);
      if (selectedDate > new Date()) {
        newErrors.expenseDate = 'Date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitAction = (status) => {
    if (!validateForm()) return;
    onSubmit(formData, status);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Receipt & Meta Upload */}
        <div className="md:col-span-1 flex flex-col gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Verification Document</h3>
          <ReceiptUpload 
            onUploadSuccess={handleReceiptUpload} 
            onUploadClear={handleReceiptClear}
            existingReceiptId={formData.receiptId}
          />
          
          <div className="text-xs text-slate-400 leading-relaxed mt-2">
            <p className="font-semibold text-slate-500 mb-1">Submission Policy:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Receipt must clearly show date, merchant, and total amount.</li>
              <li>Expenses over INR 10,000 are automatically flagged for higher-level review.</li>
              <li>Reimbursement approval takes 3-5 business days.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Expense details form */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-500" /> Expense Title
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                placeholder="e.g. Client Dinner - TechCorp Project"
                className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'} focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium text-slate-800 bg-white`}
              />
              {errors.title && <span className="text-rose-500 text-xs font-semibold">{errors.title}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-sky-500" /> Category
              </label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${errors.categoryId ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'} focus:outline-none focus:border-sky-500 transition-all font-medium text-slate-800 bg-white`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.limitAmount > 0 ? `(Max limit: ${cat.limitAmount} INR)` : ''}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="text-rose-500 text-xs font-semibold">{errors.categoryId}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-500" /> Date Incurred
              </label>
              <input 
                type="date" 
                name="expenseDate" 
                value={formData.expenseDate} 
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-xl border ${errors.expenseDate ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'} focus:outline-none focus:border-sky-500 transition-all font-medium text-slate-800 bg-white`}
              />
              {errors.expenseDate && <span className="text-rose-500 text-xs font-semibold">{errors.expenseDate}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-sky-500" /> Amount
              </label>
              <div className="flex gap-2">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-semibold text-slate-700 bg-slate-50"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <input 
                  type="number" 
                  step="0.01" 
                  name="amount" 
                  value={formData.amount} 
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.amount ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'} focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-bold text-slate-800 bg-white`}
                />
              </div>
              {errors.amount && <span className="text-rose-500 text-xs font-semibold">{errors.amount}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-500" /> Payment Method
              </label>
              <select 
                name="paymentMethod" 
                value={formData.paymentMethod} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-all font-medium text-slate-800 bg-white"
              >
                <option value="Personal Card">Personal Card</option>
                <option value="Cash">Cash</option>
                <option value="Corporate Card">Corporate Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-sky-500" /> Project / Cost Center
              </label>
              <input 
                type="text" 
                name="project" 
                value={formData.project} 
                onChange={handleChange}
                placeholder="e.g. Project Apollo (Optional)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-all font-medium text-slate-800 bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-500" /> Location
              </label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                placeholder="e.g. Bangalore, India (Optional)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-all font-medium text-slate-800 bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Detailed Description / Business Reason</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows={3}
              placeholder="Provide business justification, number of attendees, trip details, etc."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium text-slate-800 bg-white resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end items-center border-t border-slate-100 pt-6 mt-2">
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmitAction('Draft')}
              className="w-full sm:w-auto px-6 py-3 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-bold rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmitAction('Submitted')}
              className="w-full sm:w-auto px-7 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit Claim <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ExpenseForm;