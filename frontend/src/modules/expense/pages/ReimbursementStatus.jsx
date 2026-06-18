import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, CheckCircle2, AlertCircle, RefreshCw, 
  Search, Calendar, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import moment from 'moment';

function ReimbursementStatus() {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/reimbursements');
      if (response.data.success) {
        setReimbursements(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load reimbursements:', err);
      setError('Could not retrieve reimbursement records. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReimbursements();
  }, []);

  // Calculate quick stats
  const totalPaid = reimbursements
    .filter(r => r.status === 'Paid' || r.paymentStatus === 'Paid')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalPending = reimbursements
    .filter(r => r.status !== 'Paid' && r.paymentStatus !== 'Paid')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const getStatusBadge = (status, paymentStatus) => {
    const activeStatus = paymentStatus || status;
    switch (activeStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Approved (Queued)
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-full animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pending Verification
          </span>
        );
    }
  };

  const filteredReimbursements = reimbursements.filter(r => {
    const activeStatus = r.paymentStatus || r.status;
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Paid' && activeStatus === 'Paid') ||
      (statusFilter === 'Pending' && activeStatus !== 'Paid' && activeStatus !== 'Rejected') ||
      (statusFilter === 'Rejected' && activeStatus === 'Rejected');

    const matchesSearch = r.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reimbursement Payouts</h1>
            <p className="text-sm text-slate-500">Track approved expense transfers and check transaction reference updates.</p>
          </div>
          <button 
            onClick={fetchReimbursements}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl shadow-sm transition-colors text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims Processed</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{reimbursements.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Paid Payouts</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalPaid.toLocaleString()}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pending Transfer</span>
              <div className="text-2xl font-black text-amber-600 mt-1">₹{totalPending.toLocaleString()}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden">
          
          {/* Search/Filters */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
              />
            </div>
            <div className="flex gap-2 self-start sm:self-center">
              {['All', 'Pending', 'Paid', 'Rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors border ${
                    statusFilter === st 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-slate-500">Loading payout records...</span>
            </div>
          ) : filteredReimbursements.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
              <CreditCard className="w-12 h-12 text-slate-300" />
              <span className="text-base font-bold text-slate-700">No payouts to display</span>
              <span className="text-xs text-slate-400 max-w-xs">You do not have any reimbursement records matching this criteria.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <th className="p-4 pl-6 font-bold uppercase tracking-wider text-xs">ID</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Claims Category</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Billing Month</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Payout Details</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Approved Amount</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Transfer Status</th>
                    <th className="p-4 pr-6 font-bold uppercase tracking-wider text-xs text-center">Transaction Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReimbursements.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-700">REM-{r.id}</td>
                      <td className="p-4 font-semibold text-slate-800">{r.category}</td>
                      <td className="p-4 text-slate-500 font-bold">{r.month}</td>
                      <td className="p-4 max-w-[220px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-600 font-semibold truncate">{r.description || 'Expense Claims Reimbursement'}</span>
                          {r.paymentDate && (
                            <span className="text-[10px] text-slate-400 font-medium">Paid on {moment(r.paymentDate).format('MMM DD, YYYY')}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right font-extrabold text-slate-800">
                        ₹{Number(r.approvedAmount || r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(r.status, r.paymentStatus)}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        {r.transactionReference ? (
                          <div className="flex items-center justify-center gap-1 text-slate-700 font-semibold text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 select-all hover:bg-slate-200 transition-colors cursor-copy" title="Click to copy">
                            <span>{r.transactionReference}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-400" />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Processing...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default ReimbursementStatus;