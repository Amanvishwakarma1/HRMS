import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, Clock, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

const HeadcountAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token') || '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/dashboard/analytics', { headers })
      .then((res) => {
        if (res.data && res.data.success) {
          setData(res.data.data.headcount);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono tracking-widest text-slate-400 animate-pulse">
        Aggregating Headcount Statistics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-500">
        Failed to load headcount aggregates.
      </div>
    );
  }

  // Format data for Recharts
  const deptData = data.departmentWise.map(d => ({
    name: d.department,
    Employees: Number(d.count)
  }));

  const genderData = data.genderWise.map(g => ({
    name: g.gender,
    value: Number(g.count)
  }));

  const typeData = data.employmentTypeWise.map(t => ({
    name: t.employmentType,
    value: Number(t.count)
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Total Headcount Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time organizational breakdown, employee allocation, and demography stats.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="p-2 w-fit bg-blue-50 text-blue-600 rounded-xl mb-3"><Users size={16} /></span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Headcount</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.total}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="p-2 w-fit bg-emerald-50 text-emerald-600 rounded-xl mb-3"><UserCheck size={16} /></span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Employees</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.active}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="p-2 w-fit bg-rose-50 text-rose-600 rounded-xl mb-3"><UserX size={16} /></span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive Employees</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.inactive}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="p-2 w-fit bg-amber-50 text-amber-600 rounded-xl mb-3"><Clock size={16} /></span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Probation Stage</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.probation}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="p-2 w-fit bg-purple-50 text-purple-600 rounded-xl mb-3"><ShieldCheck size={16} /></span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permanent Staff</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{data.permanent}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">Department-wise Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                <Bar dataKey="Employees" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Demographics */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">Gender Distribution</h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employment Type Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 text-sm">Employment Type Breakup</h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="45%"
                  innerRadius={0}
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeadcountAnalytics;
