import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import { Check, X, HelpCircle, FileText, AlertCircle } from 'lucide-react';

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal actions state
  const [activeModal, setActiveModal] = useState(null); // { id, action: 'Reject' | 'Need Info' }
  const [reasonText, setReasonText] = useState('');

  // Check the logged-in user's role
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };
  const canApprove = ['admin', 'manager', 'hr'].includes(currentUser.role?.toLowerCase());

  if (!canApprove) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl max-w-lg mx-auto shadow-sm space-y-3">
        <h2 className="text-xl font-bold text-rose-600">Access Denied</h2>
        <p className="text-sm text-slate-500">You do not have permissions to access this screen.</p>
      </div>
    );
  }

  const fetchLeaves = async () => {
    setIsLoading(true);
    const response = await leaveService.getAllLeaves();
    if (response.success) {
      setLeaves(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!activeModal) return;

    const { id, action } = activeModal;
    const originalLeaves = [...leaves];

    // Optimistically update status locally
    setLeaves(leaves.map(leave => 
      leave.id === id ? { ...leave, status: action === 'Reject' ? 'Rejected' : 'Need Information' } : leave
    ));
    setActiveModal(null);

    const isReject = action === 'Reject';
    const response = await leaveService.updateLeaveStatus(
      id,
      isReject ? 'Rejected' : 'Need Information',
      isReject ? reasonText : '',
      isReject ? '' : reasonText
    );

    if (response.success) {
      setReasonText('');
      fetchLeaves();
    } else {
      setLeaves(originalLeaves);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleApproveDirectly = async (id) => {
    const originalLeaves = [...leaves];
    setLeaves(leaves.map(leave => 
      leave.id === id ? { ...leave, status: 'Approved' } : leave
    ));

    const response = await leaveService.updateLeaveStatus(id, 'Approved');
    if (response.success) {
      fetchLeaves();
    } else {
      setLeaves(originalLeaves);
      alert('Failed to approve request. Please try again.');
    }
  };

  // Status badges styling
  const getStatusBadgeStyle = (status) => {
    const baseClass = "text-xs font-bold px-3 py-1 rounded-full border";
    switch (status) {
      case 'Approved':
        return `${baseClass} bg-emerald-50 text-emerald-600 border-emerald-200/50`;
      case 'Rejected':
        return `${baseClass} bg-rose-50 text-rose-600 border-rose-200/50`;
      case 'Need Information':
        return `${baseClass} bg-orange-50 text-orange-600 border-orange-200/50 animate-pulse`;
      case 'Cancelled':
        return `${baseClass} bg-slate-50 text-slate-400 border-slate-200/50`;
      default:
        return `${baseClass} bg-amber-50 text-amber-600 border-amber-200/50`; // Pending
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Review Leave Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">Review team leave requests, reject with explanation, or ask for clarifications.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono tracking-widest text-slate-400 animate-pulse">
            Querying Leave Approvals queue...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/30 transition-all duration-150">
                      <td className="p-4">
                        <strong className="text-slate-800 font-bold text-sm block">{leave.employeeName}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Applied: {leave.appliedOn || 'Recent'}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-md font-medium border border-slate-200/40">
                          {leave.type}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 font-medium">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="p-4 text-xs text-slate-500 leading-relaxed max-w-xs truncate">
                        {leave.reason}
                      </td>
                      <td className="p-4">
                        {leave.status === 'Pending' || leave.status === 'Need Information' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveDirectly(leave.id)}
                              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 px-3 py-1.5 rounded-xl transition-all"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => setActiveModal({ id: leave.id, action: 'Reject' })}
                              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-xl transition-all"
                            >
                              <X size={14} /> Reject
                            </button>
                            <button
                              onClick={() => setActiveModal({ id: leave.id, action: 'Need Info' })}
                              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-600 border border-orange-200 hover:border-orange-600 px-3 py-1.5 rounded-xl transition-all"
                            >
                              <HelpCircle size={14} /> Need Info
                            </button>
                          </div>
                        ) : (
                          <span className={getStatusBadgeStyle(leave.status)}>
                            {leave.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-sm text-slate-400 font-medium">
                      No leave requests found in approvals queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Dialog Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {activeModal.action === 'Reject' ? 'Reject Leave Request' : 'Request More Information'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">
                  {activeModal.action === 'Reject' ? 'Reason for Rejection (Required)' : 'Clarification Request Message (Required)'}
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder={activeModal.action === 'Reject' ? "Explain why this leave cannot be approved..." : "Specify details required from the employee..."}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all duration-150 ${
                    activeModal.action === 'Reject'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/10'
                      : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/10'
                  }`}
                >
                  {activeModal.action === 'Reject' ? 'Confirm Rejection' : 'Send Clarification Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;