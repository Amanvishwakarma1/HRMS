import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, CheckCircle, FileText, Compass, Award, Calendar, Search } from 'lucide-react';

const Onboarding = () => {
  const [onboardings, setOnboardings] = useState([]);
  const [period, setPeriod] = useState('month'); // today, week, month
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const token = localStorage.getItem('token') || '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchOnboardings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/onboarding?period=${period}&status=${statusFilter}`, { headers });
      if (res.data && res.data.success) {
        setOnboardings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardings();
  }, [period, statusFilter]);

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await axios.put(`/api/onboarding/${id}/status`, { status: nextStatus }, { headers });
      if (res.data && res.data.success) {
        fetchOnboardings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Document Pending':
        return <FileText size={16} className="text-amber-500" />;
      case 'Verification Pending':
        return <Compass size={16} className="text-blue-500" />;
      case 'Training Pending':
        return <Award size={16} className="text-purple-500" />;
      case 'Completed':
        return <CheckCircle size={16} className="text-emerald-500" />;
      default:
        return <Compass size={16} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Document Pending': return 'bg-amber-50 text-amber-600 border border-amber-200/50';
      case 'Verification Pending': return 'bg-blue-50 text-blue-600 border border-blue-200/50';
      case 'Training Pending': return 'bg-purple-50 text-purple-600 border border-purple-200/50';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border border-emerald-200/50';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Onboarding Checklist Workflow</h1>
        <p className="text-sm text-slate-500 mt-1">Track corporate onboarding phases and document collection milestones for new joiners.</p>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Joiners Today</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">
              {onboardings.filter(o => o.joinDate === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><UserPlus size={18} /></span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Onboarding Checklist Active</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">
              {onboardings.filter(o => o.onboarding?.status !== 'Completed').length}
            </p>
          </div>
          <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Compass size={18} /></span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Onboardings</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">
              {onboardings.filter(o => o.onboarding?.status === 'Completed').length}
            </p>
          </div>
          <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={18} /></span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-xl border transition-all duration-200 ${
                period === p
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              Joined {p}
            </button>
          ))}
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">All Onboarding Stages</option>
            <option value="Document Pending">Document Pending</option>
            <option value="Verification Pending">Verification Pending</option>
            <option value="Training Pending">Training Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono tracking-widest text-slate-400 animate-pulse">
            Querying Joiners Telemetry...
          </div>
        ) : onboardings.length === 0 ? (
          <div className="p-16 text-center">
            <UserPlus size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">No new joiners found within this timeframe.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {onboardings.map((joiner) => (
              <div key={joiner.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all duration-150">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-base">{joiner.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {joiner.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">{joiner.designation || 'Specialist'}</span>
                    <span className="text-slate-400">|</span>
                    <span>{joiner.department || 'General'}</span>
                    <span className="text-slate-400">|</span>
                    <span className="flex items-center gap-1"><Calendar size={13} /> Joined: {joiner.joinDate}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {joiner.onboarding ? (
                    <>
                      <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(joiner.onboarding.status)}`}>
                        {getStatusIcon(joiner.onboarding.status)}
                        <span>{joiner.onboarding.status}</span>
                      </div>

                      {joiner.onboarding.status === 'Document Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(joiner.onboarding.id, 'Verification Pending')}
                          className="text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 px-3.5 py-1.5 rounded-xl transition-all duration-200"
                        >
                          Verify Documents
                        </button>
                      )}
                      {joiner.onboarding.status === 'Verification Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(joiner.onboarding.id, 'Training Pending')}
                          className="text-xs font-bold text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 border border-purple-200 hover:border-purple-600 px-3.5 py-1.5 rounded-xl transition-all duration-200"
                        >
                          Start Training
                        </button>
                      )}
                      {joiner.onboarding.status === 'Training Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(joiner.onboarding.id, 'Completed')}
                          className="text-xs font-bold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 px-3.5 py-1.5 rounded-xl transition-all duration-200"
                        >
                          Complete Onboarding
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Initiating checklist...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
