import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Check, X, Search, Filter, AlertCircle, 
  MapPin, Landmark, DollarSign, Calendar, Eye, Trash2, CheckCircle2, RefreshCw
} from 'lucide-react';
import payrollService from '../services/payrollService';

const CATEGORY_COLORS = {
  Travel: { bg: 'bg-sky-50 text-sky-600', border: 'border-sky-100', icon: MapPin },
  Food: { bg: 'bg-amber-50 text-amber-600', border: 'border-amber-100', icon: FileText },
  Fuel: { bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', icon: Landmark },
  Internet: { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', icon: RefreshCw },
  Medical: { bg: 'bg-rose-50 text-rose-600', border: 'border-rose-100', icon: Eye },
  Other: { bg: 'bg-slate-50 text-slate-600', border: 'border-slate-100', icon: FileText }
};

const STATUS_BADGES = {
  Submitted: 'bg-orange-50 text-orange-600 border border-orange-100',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  Approved: 'bg-blue-50 text-blue-600 border border-blue-100',
  Rejected: 'bg-rose-50 text-rose-600 border border-rose-100',
  Paid: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
};

const Reimbursement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('claim'); // claim, manage
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Submit Claim Form State
  const [formData, setFormData] = useState({
    amount: 1500,
    category: 'Travel',
    month: '2026-06',
    description: '',
    billUrl: ''
  });

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee', username: 'Employee' };
  const userRole = storedUser.role?.toLowerCase() || 'employee';
  const isFinance = userRole === 'finance' || userRole === 'admin';
  const isHR = userRole === 'hr' || userRole === 'admin' || userRole === 'finance';

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getReimbursements();
      if (res.success) {
        setClaims(res.data);
      }
    } catch (e) {
      console.error('Failed to load reimbursement claims:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      alert('Claim amount must be greater than zero.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await payrollService.createReimbursement(formData);
      if (res.success) {
        alert(res.message);
        setFormData({
          amount: 1500,
          category: 'Travel',
          month: '2026-06',
          description: '',
          billUrl: ''
        });
        loadClaims();
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    const confirmMsg = `Are you sure you want to mark this claim as ${status.toLowerCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await payrollService.approveReimbursement(id, status);
      if (res.success) {
        alert(res.message);
        loadClaims();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this claim?')) return;

    setActionLoading(true);
    try {
      const res = await payrollService.deleteReimbursement(id);
      if (res.success) {
        alert(res.message);
        loadClaims();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete claim');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations for stats
  const totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);
  const pendingClaims = claims.filter(c => c.status === 'Submitted' || c.status === 'Pending');
  const pendingAmount = pendingClaims.reduce((sum, c) => sum + c.amount, 0);
  const approvedClaims = claims.filter(c => c.status === 'Approved');
  const approvedAmount = approvedClaims.reduce((sum, c) => sum + c.amount, 0);
  const paidClaims = claims.filter(c => c.status === 'Paid');
  const paidAmount = paidClaims.reduce((sum, c) => sum + c.amount, 0);

  // Filter lists
  const filteredClaims = claims.filter(c => {
    const statusMatch = filterStatus === 'All' || c.status === filterStatus;
    const nameMatch = !c.Employee || c.Employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.Employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && nameMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Actions Panel */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reimbursements & Claims</h2>
          <p className="text-xs text-slate-400 mt-1">Submit travel, food, internet, and medical expense bills for manager/finance dispersals.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('claim')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'claim' ? 'bg-sky-500 text-white shadow' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
          >
            Submit Expense
          </button>
          {isHR && (
            <button 
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'manage' ? 'bg-sky-500 text-white shadow' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
            >
              Manage & Approve ({pendingClaims.length})
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold border border-slate-100 text-lg">
            Σ
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Claims</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">₹ {totalClaimed.toLocaleString('en-IN')}.00</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 font-bold border border-orange-100 text-lg">
            ?
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Approval</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">₹ {pendingAmount.toLocaleString('en-IN')}.00</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 font-bold border border-sky-100 text-lg">
            ✓
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Approved Cycle</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">₹ {approvedAmount.toLocaleString('en-IN')}.00</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold border border-emerald-100 text-lg">
            ₹
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Paid Out</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">₹ {paidAmount.toLocaleString('en-IN')}.00</div>
          </div>
        </div>
      </div>

      {activeTab === 'claim' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Submission Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-4 space-y-4 h-fit">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1">
              <Plus size={16} className="text-sky-500" /> New Expense Claim
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Expense Month</label>
                <input 
                  type="month" 
                  name="month" 
                  value={formData.month} 
                  onChange={handleInputChange} 
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 font-mono" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="Travel">Travel (Cab, Auto, Train, Flight)</option>
                  <option value="Food">Food (Client Meetings, Team Meals)</option>
                  <option value="Fuel">Fuel / Conveyance</option>
                  <option value="Internet">Internet / Broadband / Mobile</option>
                  <option value="Medical">Medical / Health Insurance</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Claim Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={formData.amount} 
                  onChange={handleInputChange} 
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 font-mono" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Proof Attachment / Bill URL</label>
                <input 
                  type="text" 
                  name="billUrl" 
                  value={formData.billUrl} 
                  onChange={handleInputChange} 
                  placeholder="Link to invoice pdf or bill photo" 
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Description / Rationale</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={3} 
                  placeholder="Specify client name, trip route, or purpose..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 resize-none" 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={actionLoading}
                className="w-full py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold shadow hover:bg-sky-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                Submit Expense Claim
              </button>
            </form>
          </div>

          {/* User's Claim History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-8 overflow-x-auto">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">My Expense Claims History</h3>
            
            {loading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Fetching claims history...</p>
            ) : claims.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No claims submitted yet.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Claim Month</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {claims.map((claim) => {
                    const CatConfig = CATEGORY_COLORS[claim.category] || CATEGORY_COLORS.Other;
                    const Icon = CatConfig.icon;
                    return (
                      <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-700">{claim.month}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${CatConfig.bg} ${CatConfig.border}`}>
                            <Icon size={12} /> {claim.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">₹ {claim.amount.toLocaleString('en-IN')}.00</td>
                        <td className="p-3 text-slate-500 max-w-[200px] truncate" title={claim.description}>
                          {claim.description}
                          {claim.billUrl && (
                            <a href={claim.billUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-sky-500 hover:underline mt-0.5 font-bold">
                              View Bill Receipt ↗
                            </a>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGES[claim.status] || STATUS_BADGES.Submitted}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {claim.status === 'Submitted' ? (
                            <button 
                              onClick={() => handleDelete(claim.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete claim"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage' && isHR && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          
          {/* Filters Banner */}
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>
              <div className="flex rounded-xl bg-slate-50 p-1 border border-slate-100 gap-1">
                {['All', 'Submitted', 'Approved', 'Rejected', 'Paid'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${filterStatus === st ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 text-slate-300" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee name or email..."
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Manage Claims list */}
          {loading ? (
            <p className="text-xs text-slate-400 py-4 text-center">Fetching administrative lists...</p>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">No claims match the specified criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Month</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions Panel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredClaims.map((claim) => {
                    const CatConfig = CATEGORY_COLORS[claim.category] || CATEGORY_COLORS.Other;
                    const Icon = CatConfig.icon;
                    return (
                      <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-700">{claim.Employee?.name || 'Unknown Employee'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{claim.Employee?.email} &bull; {claim.Employee?.department}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-500">{claim.month}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${CatConfig.bg} ${CatConfig.border}`}>
                            <Icon size={10} /> {claim.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">₹ {claim.amount.toLocaleString('en-IN')}.00</td>
                        <td className="p-3 text-slate-500 max-w-[220px]">
                          <div className="line-clamp-2" title={claim.description}>{claim.description}</div>
                          {claim.billUrl && (
                            <a href={claim.billUrl} target="_blank" rel="noreferrer" className="inline-block text-[10px] text-sky-500 hover:underline mt-1 font-bold">
                              View Attached Bill Receipt ↗
                            </a>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGES[claim.status] || STATUS_BADGES.Submitted}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {claim.status === 'Submitted' || claim.status === 'Pending' ? (
                            <div className="inline-flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleApprove(claim.id, 'Approved')}
                                className="px-2 py-1 bg-sky-500 text-white rounded-lg text-[10px] font-bold hover:bg-sky-600 transition-colors inline-flex items-center gap-0.5"
                                title="Approve claim"
                              >
                                <Check size={10} /> Approve
                              </button>
                              <button
                                onClick={() => handleApprove(claim.id, 'Rejected')}
                                className="px-2 py-1 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors inline-flex items-center gap-0.5"
                                title="Reject claim"
                              >
                                <X size={10} /> Reject
                              </button>
                            </div>
                          ) : claim.status === 'Approved' && isFinance ? (
                            <button
                              onClick={() => handleApprove(claim.id, 'Paid')}
                              className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors inline-flex items-center gap-0.5"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 size={10} /> Mark Paid
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold">No Pending Actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Reimbursement;