import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Search, Filter, Calendar, FileText, CheckCircle2, 
  Clock, AlertCircle, X, ExternalLink, Send, Trash2, Edit3, ArrowRight 
} from 'lucide-react';
import moment from 'moment';

function ExpenseHistory() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState({
    summary: { totalExpenses: 0, totalReimbursed: 0, pendingReimbursement: 0, pendingApproval: 0 },
    categoryBreakdown: {},
    statusDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExpensesAndStats = async () => {
    try {
      setLoading(true);
      const [expRes, statsRes] = await Promise.all([
        axios.get('/api/expenses'),
        axios.get('/api/expenses/analytics')
      ]);
      
      if (expRes.data.success) {
        setExpenses(expRes.data.data);
      }
      if (statsRes.data.success) {
        setAnalytics(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch expense records:', err);
      setError('Could not load expense records. Make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndStats();
  }, []);

  const handleOpenDetails = async (expenseId) => {
    try {
      const response = await axios.get(`/api/expenses/${expenseId}`);
      if (response.data.success) {
        setSelectedExpense(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load expense details:', err);
      alert('Failed to load detailed expense information.');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedExpense) return;

    setSubmittingComment(true);
    try {
      const response = await axios.post(`/api/expenses/${selectedExpense.id}/comment`, {
        comment: newComment
      });
      if (response.data.success) {
        setNewComment('');
        // Reload details to get fresh comment list
        handleOpenDetails(selectedExpense.id);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDirectSubmit = async (expenseId) => {
    if (!window.confirm('Are you sure you want to submit this draft claim for approval?')) return;
    try {
      const response = await axios.post(`/api/expenses/${expenseId}/submit`);
      if (response.data.success) {
        fetchExpensesAndStats();
        if (selectedExpense && selectedExpense.id === expenseId) {
          handleOpenDetails(expenseId);
        }
      }
    } catch (err) {
      console.error('Failed to submit expense:', err);
      alert(err.response?.data?.message || 'Failed to submit expense.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this draft expense claim?')) return;
    try {
      const response = await axios.delete(`/api/expenses/${expenseId}`);
      if (response.data.success) {
        setSelectedExpense(null);
        fetchExpensesAndStats();
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert(err.response?.data?.message || 'Failed to delete expense.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Submitted':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Need Information':
        return 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse';
      case 'Resubmitted':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'HR Approved':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Finance Approved':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Reimbursed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Paid':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.project && e.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          e.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Expense Claims</h1>
            <p className="text-sm text-slate-500">View and track all your personal expense claims and reimbursement timelines.</p>
          </div>
          <button 
            onClick={() => navigate('/expenses/submit')}
            className="flex items-center gap-1.5 px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all self-start sm:self-center"
          >
            <Plus className="w-5 h-5" /> New Expense Claim
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{analytics.summary.totalExpenses}</div>
            <div className="text-xs font-medium text-slate-400 mt-2">All drafts & submitted claims</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pending Approval</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              ₹{(analytics.summary.pendingApproval || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-2">Under manager/finance review</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-sky-500 uppercase tracking-wider">Approved Claims</span>
            <div className="text-2xl font-black text-sky-600 mt-1">
              ₹{(analytics.summary.pendingReimbursement || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-2">Reimbursement payout pending</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Reimbursed Payouts</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹{(analytics.summary.totalReimbursed || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-2">Successfully credited to bank</div>
          </div>
        </div>

        {/* Main List & Filters */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by title, project, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['All', 'Draft', 'Submitted', 'Need Information', 'Resubmitted', 'HR Approved', 'Finance Approved', 'Rejected', 'Reimbursed', 'Paid'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors border ${
                    statusFilter === status 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* List Table */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-slate-500">Fetching your claims...</span>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
              <FileText className="w-12 h-12 text-slate-300" />
              <span className="text-base font-bold text-slate-700">No claims found</span>
              <span className="text-xs text-slate-400 max-w-xs">There are no expense records matching the selected status or query.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <th className="p-4 pl-6 font-bold uppercase tracking-wider text-xs">ID</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Claim Title</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Category</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Date</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Status</th>
                    <th className="p-4 pr-6 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="p-4 pl-6 font-bold text-slate-800">EXP-{exp.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-700 truncate max-w-[200px]">{exp.title}</span>
                          {exp.project && (
                            <span className="text-[10px] text-slate-400 font-bold bg-slate-100/70 border border-slate-100 rounded px-1.5 py-0.5 self-start">
                              {exp.project}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{exp.category?.name || 'Miscellaneous'}</td>
                      <td className="p-4 text-slate-500 font-medium">{moment(exp.expenseDate).format('MMM DD, YYYY')}</td>
                      <td className="p-4 text-right font-extrabold text-slate-800">
                        {exp.currency} {Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusStyle(exp.status)}`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(exp.status === 'Draft' || exp.status === 'Need Information') && (
                            <>
                              {exp.status === 'Draft' && (
                                <button 
                                  onClick={() => handleDirectSubmit(exp.id)}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                  title="Submit Claim"
                                >
                                  <ArrowRight className="w-4.5 h-4.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => navigate('/expenses/submit', { state: { expense: exp } })}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                title={exp.status === 'Need Information' ? "Edit & Resubmit" : "Edit Draft"}
                              >
                                <Edit3 className="w-4.5 h-4.5" />
                              </button>
                              {exp.status === 'Draft' && (
                                <button 
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                  title="Delete Draft"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              )}
                            </>
                          )}
                          <button 
                            onClick={() => handleOpenDetails(exp.id)}
                            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Details & Comments Modal Drawer */}
        {selectedExpense && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-[slideLeft_0.3s_ease-out]">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    Claim Details <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">EXP-{selectedExpense.id}</span>
                  </h2>
                  <p className="text-xs text-slate-400">Created on {moment(selectedExpense.createdAt).format('LLL')}</p>
                </div>
                <button 
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Need Info Alert banner */}
                {selectedExpense.status === 'Need Information' && selectedExpense.requestMessage && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-850 font-semibold flex flex-col gap-1.5 animate-pulse">
                    <span className="font-extrabold flex items-center gap-1.5 text-orange-800">
                      <AlertCircle className="w-4 h-4 text-orange-600" /> 
                      Action Required: Clarification Requested
                    </span>
                    <p className="bg-white/70 p-2.5 rounded-xl border border-orange-100 italic text-slate-700">
                      "{selectedExpense.requestMessage}"
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedExpense(null);
                        navigate('/expenses/submit', { state: { expense: selectedExpense } });
                      }}
                      className="mt-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-md self-start"
                    >
                      Pre-populate & Resubmit
                    </button>
                  </div>
                )}

                {/* Rejected Alert banner */}
                {selectedExpense.status === 'Rejected' && selectedExpense.rejectionReason && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-800 font-semibold flex flex-col gap-1.5">
                    <span className="font-extrabold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" /> 
                      Rejection Reason
                    </span>
                    <p className="bg-white/70 p-2.5 rounded-xl border border-rose-100 italic text-slate-700">
                      "{selectedExpense.rejectionReason}"
                    </p>
                  </div>
                )}

                {/* Status and Title Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                    <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getStatusStyle(selectedExpense.status)}`}>
                      {selectedExpense.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Claim Amount</span>
                    <span className="text-xl font-black text-slate-800">
                      {selectedExpense.currency} {Number(selectedExpense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Title</span>
                    <span className="text-slate-700">{selectedExpense.title}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Category</span>
                    <span className="text-slate-700">{selectedExpense.category?.name}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Date Incurred</span>
                    <span className="text-slate-700">{moment(selectedExpense.expenseDate).format('LL')}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Payment Method</span>
                    <span className="text-slate-700">{selectedExpense.paymentMethod}</span>
                  </div>
                  {selectedExpense.project && (
                    <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                      <span className="text-slate-400">Project / Cost Center</span>
                      <span className="text-slate-700">{selectedExpense.project}</span>
                    </div>
                  )}
                  {selectedExpense.location && (
                    <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                      <span className="text-slate-400">Location</span>
                      <span className="text-slate-700">{selectedExpense.location}</span>
                    </div>
                  )}
                </div>

                {selectedExpense.description && (
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-xs">
                    <span className="font-bold text-slate-400">Business Justification / Notes</span>
                    <p className="text-slate-600 leading-relaxed font-semibold">{selectedExpense.description}</p>
                  </div>
                )}

                {/* Receipt Preview */}
                {selectedExpense.receipts && selectedExpense.receipts.length > 0 ? (
                  <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-500" /> Attached Receipt Document
                    </h4>
                    {selectedExpense.receipts.map(rc => (
                      <div key={rc.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-xs truncate max-w-[200px]">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-slate-600 font-semibold truncate">{rc.filename}</span>
                        </div>
                        <a 
                          href={`http://localhost:5000${rc.fileUrl}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800"
                        >
                          View File <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-400">
                    No receipt uploaded for this expense claim.
                  </div>
                )}

                {/* Approvals Timeline */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">Approvals Status Timeline</h4>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    
                    {/* Creation step */}
                    <div className="relative before:absolute before:-left-6 before:top-1.5 before:w-3 before:h-3 before:rounded-full before:bg-emerald-500 before:border-2 before:border-white">
                      <div className="text-xs font-bold text-slate-700">Claim Created</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By {selectedExpense.employee?.name} on {moment(selectedExpense.createdAt).format('LLL')}</div>
                    </div>

                    {/* Submit step */}
                    {selectedExpense.submittedAt && (
                      <div className="relative before:absolute before:-left-6 before:top-1.5 before:w-3 before:h-3 before:rounded-full before:bg-sky-500 before:border-2 before:border-white">
                        <div className="text-xs font-bold text-slate-700">Claim Submitted for Approval</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Routed to Manager on {moment(selectedExpense.submittedAt).format('LLL')}</div>
                      </div>
                    )}

                    {/* Approvals array list */}
                    {selectedExpense.approvals && selectedExpense.approvals.map((ap) => (
                      <div key={ap.id} className="relative before:absolute before:-left-6 before:top-1.5 before:w-3 before:h-3 before:rounded-full before:bg-sky-500 before:border-2 before:border-white">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          {ap.role} {ap.status} 
                          <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            ap.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {ap.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Verified by {ap.employee?.name || 'Authorized User'} on {moment(ap.createdAt).format('LLL')}</div>
                        {ap.comments && (
                          <div className="text-[10px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100 mt-1.5 italic font-medium">
                            "{ap.comments}"
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Final paid status */}
                    {selectedExpense.status === 'Reimbursed' && (
                      <div className="relative before:absolute before:-left-6 before:top-1.5 before:w-3 before:h-3 before:rounded-full before:bg-emerald-500 before:border-2 before:border-white">
                        <div className="text-xs font-bold text-slate-700">Reimbursement Completed</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Payout processed on {selectedExpense.reimbursedAt ? moment(selectedExpense.reimbursedAt).format('LLL') : 'N/A'}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Thread */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">Discussion & Activity</h4>
                  <div className="space-y-3">
                    {selectedExpense.comments && selectedExpense.comments.map((cm) => (
                      <div key={cm.id} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100/60 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">{cm.employee?.name}</span>
                          <span className="text-[9px] font-bold text-slate-400">{moment(cm.createdAt).fromNow()}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold">{cm.comment}</p>
                      </div>
                    ))}
                    
                    {(!selectedExpense.comments || selectedExpense.comments.length === 0) && (
                      <div className="text-center py-4 text-xs text-slate-400 italic">
                        No discussion yet. Start the thread below.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Comment Input Footer */}
              <form onSubmit={handlePostComment} className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 items-center">
                <input 
                  type="text" 
                  placeholder="Post comment or question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-semibold text-xs text-slate-700"
                />
                <button 
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="p-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
      
      {/* Dynamic Slide Drawer CSS rules */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

export default ExpenseHistory;