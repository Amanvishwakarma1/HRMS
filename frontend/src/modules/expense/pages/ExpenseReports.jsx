import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Download, Calendar, Tag, Filter, RefreshCw, 
  TrendingUp, PieChart as PieIcon, FileText, CheckCircle 
} from 'lucide-react';
import moment from 'moment';

const COLORS = ['#0ea5e9', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#64748b'];

function ExpenseReports() {
  const [categories, setCategories] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    categoryId: '',
    status: ''
  });

  const loadFilterData = async () => {
    try {
      setLoading(true);
      const [catRes, reportRes, analyticsRes] = await Promise.all([
        axios.get('/api/expenses/categories'),
        axios.get('/api/expenses/reports', { params: filters }),
        axios.get('/api/expenses/analytics')
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }
      if (reportRes.data.success) {
        setReportData(reportRes.data.data);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const response = await axios.get(`/api/expenses/export/${format}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Expense_Report_${moment().format('YYYY-MM-DD')}.${format === 'csv' ? 'csv' : 'txt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Process data for charts
  const getTrendData = () => {
    if (!analytics || !analytics.monthlyTrend) return [];
    return Object.keys(analytics.monthlyTrend).map(month => ({
      name: moment(month, 'YYYY-MM').format('MMM YYYY'),
      Amount: analytics.monthlyTrend[month]
    })).sort((a, b) => moment(a.name, 'MMM YYYY').diff(moment(b.name, 'MMM YYYY')));
  };

  const getPieData = () => {
    if (!analytics || !analytics.categoryBreakdown) return [];
    return Object.keys(analytics.categoryBreakdown).map(cat => ({
      name: cat,
      value: analytics.categoryBreakdown[cat]
    }));
  };

  const trendData = getTrendData();
  const pieData = getPieData();

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
            <p className="text-sm text-slate-500">Monitor expenditure trends, categories distributions, and export tabular data.</p>
          </div>
          
          <div className="flex gap-2.5">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-colors text-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-850 hover:bg-slate-800 bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" /> Export TXT Summary
            </button>
          </div>
        </div>

        {/* Analytics Visualization Panel */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Monthly Trend Area Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-sky-500" /> Monthly Expense Trend
              </h3>
              <div className="h-64">
                {trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                    Not enough data to map trends.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Amount" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <PieIcon className="w-4.5 h-4.5 text-sky-500" /> Category Distribution
              </h3>
              <div className="h-52 relative">
                {pieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                    No categories data.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              {/* Pie Legends */}
              <div className="flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto pb-1 mt-2 text-[10px] font-semibold text-slate-500">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Filter Bar & Rows Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden">
          
          {/* Filters Form */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" /> Filter Criteria
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Start Date</label>
                <input 
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-xs font-semibold text-slate-700 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">End Date</label>
                <input 
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-xs font-semibold text-slate-700 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Category</label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Manager Approved">Manager Approved</option>
                  <option value="Approved">Approved</option>
                  <option value="Reimbursed">Reimbursed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Preview */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-slate-500">Querying data records...</span>
            </div>
          ) : reportData.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
              <FileText className="w-12 h-12 text-slate-300" />
              <span className="text-base font-bold text-slate-700">No report rows found</span>
              <span className="text-xs text-slate-400 max-w-xs">Try extending the date range or selecting another category.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <th className="p-4 pl-6 font-bold uppercase tracking-wider text-xs">ID</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Employee</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Title</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Category</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Date</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                    <th className="p-4 pr-6 font-bold uppercase tracking-wider text-xs text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-700">EXP-{row.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{row.employee?.name || 'Self'}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{row.employee?.department || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{row.title}</td>
                      <td className="p-4 font-medium text-slate-500">{row.category?.name || 'Miscellaneous'}</td>
                      <td className="p-4 text-center text-slate-500 font-medium">{moment(row.expenseDate).format('YYYY-MM-DD')}</td>
                      <td className="p-4 text-right font-extrabold text-slate-800">
                        {row.currency} {Number(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border border-slate-200 bg-slate-50 text-slate-600`}>
                          {row.status}
                        </span>
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

export default ExpenseReports;
