import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, XCircle, AlertCircle, FileText, X, Check, 
  Send, ExternalLink, RefreshCw, User, ShieldCheck, DollarSign,
  Calendar, Inbox, ChevronRight, Download, ZoomIn, Info, HelpCircle, Eye
} from 'lucide-react';
import moment from 'moment';

function ExpenseApproval() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected claim detail
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [historyTimeline, setHistoryTimeline] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Checkbox states
  const [selectedIds, setSelectedIds] = useState([]);

  // Decision Modal Control
  const [decisionType, setDecisionType] = useState(null); // 'approve', 'reject', 'request-info'
  const [decisionComments, setDecisionComments] = useState('');
  const [financeApprovedAmount, setFinanceApprovedAmount] = useState('');
  const [financeNotes, setFinanceNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Quick action reject ID
  const [quickRejectId, setQuickRejectId] = useState(null);

  // Zoom Attachment Lightbox
  const [zoomReceiptUrl, setZoomReceiptUrl] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee', username: 'User' };
  const userRole = currentUser.role?.toLowerCase();

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/expenses/pending-approval');
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
      setError('Could not retrieve pending claims. Verify you have HR, Finance, or Admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleOpenDetails = async (expense) => {
    setSelectedExpense(expense);
    setDecisionType(null);
    setDecisionComments('');
    setFinanceApprovedAmount(expense.amount);
    setFinanceNotes('');
    
    // Fetch chronological comments/approvals log
    setLoadingHistory(true);
    try {
      const historyRes = await axios.get(`/api/expenses/approval-history/${expense.id}`);
      if (historyRes.data.success) {
        setHistoryTimeline(historyRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch approval timeline:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAction = async (actionType, targetId = null) => {
    const id = targetId || selectedExpense?.id;
    if (!id) return;
    
    setActionLoading(true);
    try {
      let url = `/api/expenses/${id}/${actionType}`;
      let payload = {};

      if (actionType === 'approve') {
        payload.comments = decisionComments;
        if (userRole === 'finance') {
          payload.approvedAmount = Number(financeApprovedAmount);
          payload.financeNotes = financeNotes;
          if (isNaN(payload.approvedAmount) || payload.approvedAmount <= 0) {
            alert('Please specify a valid approved amount.');
            setActionLoading(false);
            return;
          }
        }
      } else if (actionType === 'reject') {
        if (!decisionComments.trim()) {
          alert('Rejection reason is mandatory.');
          setActionLoading(false);
          return;
        }
        payload.rejectionReason = decisionComments;
      } else if (actionType === 'request-info') {
        if (!decisionComments.trim()) {
          alert('Information request message is required.');
          setActionLoading(false);
          return;
        }
        payload.requestMessage = decisionComments;
      }

      const response = await axios.post(url, payload);
      if (response.data.success) {
        setSelectedExpense(null);
        setDecisionType(null);
        setQuickRejectId(null);
        setSelectedIds(prev => prev.filter(item => item !== id));
        fetchPendingApprovals();
        alert(`Expense EXP-${id} successfully processed!`);
      }
    } catch (err) {
      console.error(`Failed to process action ${actionType}:`, err);
      alert(err.response?.data?.message || `Failed to perform action.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk actions handlers
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to approve ${selectedIds.length} selected claims?`)) return;

    setActionLoading(true);
    try {
      const response = await axios.post('/api/expenses/bulk-approve', { ids: selectedIds });
      if (response.data.success) {
        alert(response.data.message || `Successfully approved selection!`);
        setSelectedIds([]);
        fetchPendingApprovals();
      }
    } catch (err) {
      console.error('Bulk approval error:', err);
      alert('Bulk approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    const reason = window.prompt(`Please provide a rejection reason for the ${selectedIds.length} selected claims (Mandatory):`);
    if (reason === null) return; // cancel click
    if (!reason.trim()) {
      alert('Rejection reason is mandatory for bulk rejection.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post('/api/expenses/bulk-reject', { 
        ids: selectedIds,
        rejectionReason: reason
      });
      if (response.data.success) {
        alert(response.data.message || `Successfully rejected selection!`);
        setSelectedIds([]);
        fetchPendingApprovals();
      }
    } catch (err) {
      console.error('Bulk rejection error:', err);
      alert('Bulk rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    // Export selected items as a basic CSV download
    const selectedExpenses = expenses.filter(e => selectedIds.includes(e.id));
    let csv = 'Expense ID,Employee,Category,Title,Amount,Currency,Date,Status,Project\n';
    selectedExpenses.forEach(e => {
      csv += `${e.id},"${e.employee?.name || ''}","${e.category?.name || ''}","${e.title}",${e.amount},${e.currency},${e.expenseDate},${e.status},"${e.project || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `Bulk_Export_Expenses_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Checkbox helpers
  const handleCheckboxChange = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(expenses.map(exp => exp.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Metadata calculations
  const getApprovalAge = (createdAt) => {
    const diffHours = moment().diff(moment(createdAt), 'hours');
    if (diffHours < 24) {
      return diffHours <= 0 ? 'Just now' : `${diffHours}h ago`;
    }
    const diffDays = moment().diff(moment(createdAt), 'days');
    return `${diffDays}d ago`;
  };

  const getPriority = (createdAt, amount) => {
    const diffDays = moment().diff(moment(createdAt), 'days');
    const numAmount = Number(amount);
    if (diffDays >= 3 || numAmount >= 15000) {
      return { label: 'High', style: 'bg-rose-50 text-rose-700 border-rose-100' };
    } else if (diffDays >= 1 || numAmount >= 5000) {
      return { label: 'Medium', style: 'bg-amber-50 text-amber-700 border-amber-100' };
    }
    return { label: 'Low', style: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Resubmitted':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Need Information':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'HR Approved':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Finance Approved':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // Quick action reject trigger
  const triggerQuickReject = (e, id) => {
    e.stopPropagation();
    const reason = window.prompt("Please provide a rejection reason (Mandatory):");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Rejection reason is mandatory.");
      return;
    }
    
    // Call API directly
    setActionLoading(true);
    axios.post(`/api/expenses/${id}/reject`, { rejectionReason: reason })
      .then(res => {
        if (res.data.success) {
          fetchPendingApprovals();
          alert(`Claim EXP-${id} rejected successfully.`);
        }
      })
      .catch(err => {
        console.error(err);
        alert(err.response?.data?.message || "Failed to reject claim.");
      })
      .finally(() => setActionLoading(false));
  };

  const triggerQuickApprove = (e, id) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to approve claim EXP-${id} immediately?`)) return;

    setActionLoading(true);
    axios.post(`/api/expenses/${id}/approve`, { comments: "Quick Approved" })
      .then(res => {
        if (res.data.success) {
          fetchPendingApprovals();
          alert(`Claim EXP-${id} approved successfully.`);
        }
      })
      .catch(err => {
        console.error(err);
        alert(err.response?.data?.message || "Failed to approve claim.");
      })
      .finally(() => setActionLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Approvals Queue</h1>
            <p className="text-sm text-slate-500">
              Logged in as <span className="font-bold text-slate-700 uppercase">{userRole}</span>. Select claims to verify receipts, audit priority states, and run workflows.
            </p>
          </div>
          
          <button 
            onClick={fetchPendingApprovals}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl shadow-sm transition-colors text-xs self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Lists
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Approvals Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden mb-20">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-slate-500">Querying approvals list...</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
              <ShieldCheck className="w-12 h-12 text-slate-300" />
              <span className="text-base font-bold text-slate-700">Approvals queue is empty</span>
              <span className="text-xs text-slate-400 max-w-xs">There are no pending claims waiting for review under your role queue.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <th className="p-4 pl-6 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedIds.length === expenses.length && expenses.length > 0}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-350"
                      />
                    </th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">ID</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Employee</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Category</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Claim Title</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Submitted Date</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Age</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Priority</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Status</th>
                    <th className="p-4 pr-6 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => {
                    const priority = getPriority(exp.createdAt, exp.amount);
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(exp.id)}
                            onChange={() => handleCheckboxChange(exp.id)}
                            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                          />
                        </td>
                        <td className="p-4 font-bold text-slate-800">EXP-{exp.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0 font-bold text-xs">
                              {exp.employee?.name ? exp.employee.name.charAt(0) : 'E'}
                            </div>
                            <div className="flex flex-col truncate max-w-[120px]">
                              <span className="font-semibold text-slate-700 truncate">{exp.employee?.name || 'Employee'}</span>
                              <span className="text-[10px] text-slate-400 font-bold truncate">{exp.employee?.department || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-600">{exp.category?.name || 'Miscellaneous'}</td>
                        <td className="p-4 font-semibold text-slate-700 truncate max-w-[150px]">{exp.title}</td>
                        <td className="p-4 text-slate-500 font-medium">{moment(exp.submittedAt || exp.createdAt).format('MMM DD, YYYY')}</td>
                        <td className="p-4 text-center text-slate-500 font-bold">{getApprovalAge(exp.createdAt)}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded border ${priority.style}`}>
                            {priority.label}
                          </span>
                        </td>
                        <td className="p-4 text-right font-extrabold text-slate-800">
                          {exp.currency} {Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(exp.status)}`}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => triggerQuickApprove(e, exp.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-lg transition-all"
                              title="Quick Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => triggerQuickReject(e, exp.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition-all"
                              title="Quick Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenDetails(exp)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all"
                              title="Detailed Review"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-950/20 px-6 py-4 flex items-center gap-6 animate-[slideUp_0.3s_ease-out] border border-slate-800">
            <span className="text-xs font-bold shrink-0">
              <span className="px-2 py-0.5 bg-sky-500 text-slate-950 rounded-lg text-[10px] font-black mr-2">
                {selectedIds.length}
              </span>
              Claims Selected
            </span>
            <div className="h-4 w-px bg-slate-800 shrink-0"></div>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkApprove}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/10 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Approve Selected
              </button>
              <button 
                onClick={handleBulkReject}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-xs font-bold rounded-xl transition-all shadow-sm shadow-rose-500/10 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reject Selected
              </button>
              <button 
                onClick={handleBulkExport}
                className="px-3.5 py-1.5 bg-slate-850 bg-slate-800 hover:bg-slate-750 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export Selected
              </button>
            </div>
          </div>
        )}

        {/* Detailed Review Overlay Modal Drawer */}
        {selectedExpense && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-[slideLeft_0.3s_ease-out]">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    Review Claim <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">EXP-{selectedExpense.id}</span>
                  </h2>
                  <p className="text-xs text-slate-400">Claim submitted on {moment(selectedExpense.submittedAt || selectedExpense.createdAt).format('LLL')}</p>
                </div>
                <button 
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Employee Details Card */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-black text-sm border border-sky-200 shrink-0 shadow-sm">
                    {selectedExpense.employee?.name ? selectedExpense.employee.name.charAt(0) : 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-400 font-bold block">EMPLOYEE INFORMATION</span>
                    <span className="text-base font-extrabold text-slate-800 block truncate">{selectedExpense.employee?.name}</span>
                    <div className="text-[11px] text-slate-500 font-semibold flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      <span>ID: EMP-{selectedExpense.employee?.id}</span>
                      <span>•</span>
                      <span>Dept: {selectedExpense.employee?.department}</span>
                      <span>•</span>
                      <span>Designation: {selectedExpense.employee?.designation}</span>
                      <span>•</span>
                      <span>Manager: <span className="text-slate-700 font-bold">{selectedExpense.managerName || 'Charlie Davis'}</span></span>
                    </div>
                  </div>
                </div>

                {/* Claim Amount Details */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between border border-slate-800 shadow-lg shadow-slate-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requested Category</span>
                    <span className="text-sm font-extrabold text-sky-400">{selectedExpense.category?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Claimed Amount</span>
                    <span className="text-2xl font-black text-white">
                      {selectedExpense.currency} {Number(selectedExpense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Expense Details list */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Expense Title</span>
                    <span className="text-slate-700 truncate">{selectedExpense.title}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Date Incurred</span>
                    <span className="text-slate-700">{moment(selectedExpense.expenseDate).format('LL')}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Payment Mode</span>
                    <span className="text-slate-700">{selectedExpense.paymentMethod}</span>
                  </div>
                  {selectedExpense.location && (
                    <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                      <span className="text-slate-400">Location Incurred</span>
                      <span className="text-slate-700 truncate">{selectedExpense.location}</span>
                    </div>
                  )}
                  {selectedExpense.project && (
                    <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                      <span className="text-slate-400">Project / Cost Center</span>
                      <span className="text-slate-700 truncate">{selectedExpense.project}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400">Workflow Status</span>
                    <span className={`inline-flex self-start px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusStyle(selectedExpense.status)}`}>
                      {selectedExpense.status}
                    </span>
                  </div>
                </div>

                {selectedExpense.description && (
                  <div className="flex flex-col gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-xs">
                    <span className="font-bold text-slate-400">Description Notes</span>
                    <p className="text-slate-600 leading-relaxed font-semibold">{selectedExpense.description}</p>
                  </div>
                )}

                {/* Receipt verification Section */}
                <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-500" /> Attached Receipts Gallery
                  </h4>
                  {selectedExpense.receipts && selectedExpense.receipts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedExpense.receipts.map(rc => {
                        const isImg = rc.filename.endsWith('.png') || rc.filename.endsWith('.jpg') || rc.filename.endsWith('.jpeg');
                        return (
                          <div key={rc.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between gap-3 group relative">
                            <div className="flex items-center gap-2 text-xs truncate">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="text-slate-600 font-semibold truncate" title={rc.filename}>{rc.filename}</span>
                            </div>
                            
                            {isImg && (
                              <div className="w-full h-24 rounded-lg bg-slate-200 overflow-hidden relative border border-slate-100 group">
                                <img 
                                  src={`http://localhost:5000${rc.fileUrl}`} 
                                  alt="receipt" 
                                  className="w-full h-full object-cover"
                                />
                                <div 
                                  onClick={() => setZoomReceiptUrl(`http://localhost:5000${rc.fileUrl}`)}
                                  className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
                                >
                                  <ZoomIn className="w-5 h-5" />
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                              <span>{(rc.fileSize / 1024).toFixed(1)} KB</span>
                              <a 
                                href={`http://localhost:5000${rc.fileUrl}`}
                                download={rc.filename}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-0.5 text-sky-600 hover:text-sky-800"
                              >
                                Download File <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50/20 border border-dashed border-rose-100 text-rose-500 rounded-xl text-center text-xs font-semibold">
                      ⚠️ No receipts attached. Verify expense details carefully!
                    </div>
                  )}
                </div>

                {/* Approvals Timeline & Status Log History */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">Workflow Log History</h4>
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : historyTimeline.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No logs tracked.</div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {historyTimeline.map((item, idx) => (
                        <div key={idx} className="relative before:absolute before:-left-6 before:top-1.5 before:w-3 before:h-3 before:rounded-full before:bg-sky-500 before:border-2 before:border-white">
                          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            {item.type === 'approval' ? (
                              <>
                                <span>{item.user} ({item.role})</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                  item.status.includes('Approved') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  item.status.includes('Information') ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                  'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                  {item.status}
                                </span>
                              </>
                            ) : (
                              <span>{item.user} ({item.role}) posted comment</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {moment(item.date).format('LLL')}
                          </div>
                          {(item.comments || item.comment) && (
                            <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2.5 border border-slate-100/60 mt-1 italic font-semibold leading-relaxed">
                              "{item.comments || item.comment}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Decision Footer Panel */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                
                {decisionType ? (
                  // Conditional Form Fields based on decision selection
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                        <Info className="w-4 h-4 text-sky-500" />
                        {decisionType === 'approve' ? 'Confirm Claim Approval' :
                         decisionType === 'reject' ? 'Confirm Claim Rejection' :
                         'Request Clarification'}
                      </span>
                      <button 
                        onClick={() => setDecisionType(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {decisionType === 'approve' && userRole === 'finance' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-500">Approved Payout Amount (₹)</label>
                          <input 
                            type="number"
                            value={financeApprovedAmount}
                            onChange={(e) => setFinanceApprovedAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-xs font-bold text-slate-700 bg-slate-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-500">Finance Payout Notes (Optional)</label>
                          <input 
                            type="text"
                            placeholder="Enter notes..."
                            value={financeNotes}
                            onChange={(e) => setFinanceNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-xs font-medium text-slate-700 bg-slate-50"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">
                        {decisionType === 'approve' ? 'Approval Comments (Optional)' :
                         decisionType === 'reject' ? 'Reason for Rejection (Mandatory)' :
                         'Message for Employee (Mandatory)'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Provide details..."
                        value={decisionComments}
                        onChange={(e) => setDecisionComments(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-xs font-semibold text-slate-700 bg-slate-50 resize-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setDecisionType(null)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction(decisionType)}
                        disabled={actionLoading || (decisionType !== 'approve' && !decisionComments.trim())}
                        className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
                          decisionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10' :
                          decisionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/10' :
                          'bg-orange-600 hover:bg-orange-700 shadow-orange-500/10'
                        } disabled:opacity-50`}
                      >
                        {actionLoading ? 'Processing...' :
                         decisionType === 'approve' ? 'Confirm Approval' :
                         decisionType === 'reject' ? 'Confirm Rejection' :
                         'Submit Request'}
                      </button>
                    </div>

                  </div>
                ) : (
                  // General Review Decision buttons
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDecisionType('reject')}
                        className="flex-1 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4.5 h-4.5" /> Reject Claim
                      </button>
                      <button
                        onClick={() => setDecisionType('approve')}
                        className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 text-xs transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" /> Approve Claim
                      </button>
                    </div>
                    
                    {userRole === 'hr' && (
                      <button
                        onClick={() => setDecisionType('request-info')}
                        className="w-full py-2.5 border border-amber-200 hover:bg-amber-50 text-amber-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <HelpCircle className="w-4 h-4" /> Request More Information
                      </button>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* Zoom Lightbox Modal */}
        {zoomReceiptUrl && (
          <div 
            onClick={() => setZoomReceiptUrl(null)}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
          >
            <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
              <img 
                src={zoomReceiptUrl} 
                alt="zoomed receipt" 
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
              <button 
                onClick={() => setZoomReceiptUrl(null)}
                className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
}

export default ExpenseApproval;