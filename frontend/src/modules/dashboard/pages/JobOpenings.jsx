import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, User, Calendar, MapPin, Check, X, Search, Trash2, Plus, Users } from 'lucide-react';

const JobOpenings = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // New Job form state
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    vacancyCount: 1,
    description: ''
  });

  const token = localStorage.getItem('token') || '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/jobs?search=${search}&department=${deptFilter}`, { headers });
      if (res.data && res.data.success) {
        setJobs(res.data.data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, deptFilter]);

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/jobs', newJob, { headers });
      if (res.data && res.data.success) {
        setShowAddModal(false);
        setNewJob({ title: '', department: 'Engineering', vacancyCount: 1, description: '' });
        fetchJobs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating job');
    }
  };

  const handleCloseJob = async (id) => {
    try {
      const res = await axios.put(`/api/jobs/${id}/close`, {}, { headers });
      if (res.data && res.data.success) {
        fetchJobs();
        if (selectedJob && selectedJob.id === id) {
          setSelectedJob({ ...selectedJob, status: 'Closed' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    try {
      const res = await axios.delete(`/api/jobs/${id}`, { headers });
      if (res.data && res.data.success) {
        fetchJobs();
        setSelectedJob(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    try {
      const res = await axios.get(`/api/jobs/${job.id}/applicants`, { headers });
      if (res.data && res.data.success) {
        setApplicants(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    try {
      const res = await axios.put(`/api/applicants/${appId}/status`, { status: newStatus }, { headers });
      if (res.data && res.data.success) {
        // Refresh applicants
        if (selectedJob) {
          handleSelectJob(selectedJob);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Open Positions & Recruitment</h1>
          <p className="text-sm text-slate-500 mt-1">Manage corporate job vacancies and track applicant review queues.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/10 transition-all hover:scale-[1.02] duration-200"
        >
          <Plus size={18} /> Add Job Position
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-md font-bold text-slate-700">Active Postings</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <Briefcase className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-medium text-slate-500">No active job openings found.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleSelectJob(job)}
                className={`bg-white border p-5 rounded-2xl cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 relative ${
                  selectedJob && selectedJob.id === job.id ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20' : 'border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{job.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400 font-medium">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{job.department}</span>
                      <span>Vacancies: {job.vacancyCount}</span>
                      <span>Applicants: {job.applicantsCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">{job.description || 'No description provided.'}</p>
                
                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                  {job.status === 'Active' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCloseJob(job.id); }}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/40"
                    >
                      Close Opening
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 p-1.5 rounded-lg border border-rose-200/40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Job & Applicants Queue */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-5 h-fit">
          {selectedJob ? (
            <>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{selectedJob.title}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Applicants Queue ({applicants.length})</p>
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {applicants.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="mx-auto text-slate-300 mb-2" size={24} />
                    <p className="text-xs text-slate-400">No applicants have applied yet.</p>
                  </div>
                ) : (
                  applicants.map((app) => (
                    <div key={app.id} className="border border-slate-100 rounded-xl p-3.5 space-y-3 bg-slate-50/50">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">{app.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{app.email} | {app.phone || 'No phone'}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'Applied' ? 'bg-blue-50 text-blue-600' :
                          app.status === 'Interviewing' ? 'bg-amber-50 text-amber-600' :
                          app.status === 'Offered' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {app.status}
                        </span>
                        
                        {app.status === 'Applied' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Interviewing')}
                              className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-md"
                            >
                              Interview
                            </button>
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')}
                              className="text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-md"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {app.status === 'Interviewing' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Offered')}
                              className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-md"
                            >
                              Offer Job
                            </button>
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')}
                              className="text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-md"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Briefcase className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-medium text-slate-400 leading-relaxed">Select a job opening to view candidate submissions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add New Position</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddJob} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Dev"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Department</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newJob.vacancyCount}
                    onChange={(e) => setNewJob({ ...newJob, vacancyCount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Job Description</label>
                <textarea
                  rows="3"
                  placeholder="Role details, requirements..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10"
                >
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOpenings;
