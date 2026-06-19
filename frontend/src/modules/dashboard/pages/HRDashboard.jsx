import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { MapPin, Megaphone, Calendar, FileText, Plus, X, AlertCircle } from 'lucide-react';
import HomeClockInOut from '../../attendance/components/HomeClockInOut';
import ThreeDCard from '../../../components/ThreeDCard';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Announcement Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    priority: 'Medium',
    targetAudience: 'All',
    targetId: '',
    expiryDate: ''
  });

  const token = localStorage.getItem('token') || '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/dashboard/analytics', { headers });
      if (res.data && res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/announcements', broadcastForm, { headers });
      if (res.data && res.data.success) {
        setShowBroadcastModal(false);
        setBroadcastForm({
          title: '',
          message: '',
          priority: 'Medium',
          targetAudience: 'All',
          targetId: '',
          expiryDate: ''
        });
        fetchAnalytics(); // reload stats
        alert('📢 Announcement broadcasted successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing announcement');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono tracking-widest text-slate-400 animate-pulse">
        Initializing HR Analytics Matrix...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-500">
        Failed to load HR metrics.
      </div>
    );
  }

  const { headcount, recruitment, onboarding, leaves, approvals, announcements } = analytics;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Portal Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">HR Control Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Orchestrate recruitment, onboarding stages, policy broadcasts, and workforce logs.</p>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div onClick={() => navigate('/jobs')} className="cursor-pointer">
          <StatCard title="Open Positions" value={recruitment.totalOpenPositions} trend="up" trendText="Live Jobs" color="#8b5cf6" />
        </div>
        <div onClick={() => navigate('/onboarding')} className="cursor-pointer">
          <StatCard title="New Onboardings" value={onboarding.joinersMonth} trend="up" trendText="This Month" color="#10b981" />
        </div>
        <div onClick={() => navigate('/headcount')} className="cursor-pointer">
          <StatCard title="Total Headcount" value={headcount.total} trend="up" trendText="Active Staff" color="#3b82f6" />
        </div>
      </div>

      {/* Clock In / Out telemetry widget */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
        <HomeClockInOut />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recruitment Status widget */}
        <ThreeDCard depth="15px" style={{ borderRadius: '24px' }}>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                💼 Job Postings & Hiring
              </h2>
              <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-blue-600 hover:underline">
                Manage Jobs →
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
              {recruitment.activeJobs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No active job openings listed.</p>
              ) : (
                recruitment.activeJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-700">{job.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{job.department} | Vacancies: {job.vacancyCount}</p>
                    </div>
                    <span className="bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full font-bold">
                      {job.applicantsCount} Applicants
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </ThreeDCard>

        {/* Live Employee Tracking Card */}
        <ThreeDCard depth="15px" style={{ borderRadius: '24px' }}>
          <div className="p-6 space-y-4">
            <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <MapPin size={18} className="text-blue-600 animate-bounce" /> Spatial Fleet Telemetry
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trace geofence coordinate maps, verify punch-in locations, and monitor active workforce distributions globally.
            </p>
            <button
              onClick={() => navigate('/attendance/tracking')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/10 transition-all hover:scale-[1.01]"
            >
              🗺️ Open Live Tracking Map
            </button>
          </div>
        </ThreeDCard>

        {/* Leave Approvals Card */}
        <ThreeDCard depth="15px" style={{ borderRadius: '24px' }}>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                ✓ Leave & Approvals Queue
              </h2>
              <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {approvals.pendingCount} Pending Approvals
              </span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage leave records, regularization schedules, and process approvals for leaves and expense payouts.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/leave/approval')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/10 transition-all hover:scale-[1.01]"
              >
                Review Pending
              </button>
              <button
                onClick={() => navigate('/leave')}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all hover:scale-[1.01]"
              >
                Leave Dashboard
              </button>
            </div>
          </div>
        </ThreeDCard>

        {/* Latest Announcements widget */}
        <ThreeDCard depth="15px" style={{ borderRadius: '24px' }}>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                📢 Policy Broadcast Feed
              </h2>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Broadcast Announcement
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
              {announcements.latest.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No active announcements published.</p>
              ) : (
                announcements.latest.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">{item.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                        item.priority === 'High' ? 'bg-orange-50 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </ThreeDCard>
        
      </div>

      {/* Broadcast Announcement Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Broadcast Announcement</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-slate-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Closure Notice"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Message Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed message description..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Priority</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Target Audience</label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="All">All Employees</option>
                    <option value="Department">Department Specific</option>
                    <option value="Role">Role Specific</option>
                    <option value="Individual">Individual User</option>
                  </select>
                </div>
              </div>

              {broadcastForm.targetAudience !== 'All' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Target Identifier (Dept Name, Role, or User ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering, manager, or 4"
                    value={broadcastForm.targetId}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={broadcastForm.expiryDate}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;