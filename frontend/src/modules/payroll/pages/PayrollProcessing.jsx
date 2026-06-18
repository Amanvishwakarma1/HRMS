import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, CreditCard, Clock, FileText, 
  Download, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Plus, Send, Landmark
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import payrollService from '../services/payrollService';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const PayrollProcessing = () => {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('employeeName');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'Admin', role: 'admin' };
  const userRole = storedUser.role.toLowerCase();
  const isFinance = userRole === 'finance' || userRole === 'admin';
  const isHR = userRole === 'hr' || userRole === 'admin';

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const runRes = await payrollService.getPayrollRuns();
      if (runRes.success) {
        setRuns(runRes.data);
        // Default to latest run
        if (runRes.data.length > 0) {
          const latest = runRes.data[0];
          setSelectedRun(latest);
          const recordsRes = await payrollService.getPayrollRecords(latest.id);
          if (recordsRes.success) {
            setRecords(recordsRes.data);
          }
        }
      }
      const empRes = await payrollService.getEmployees();
      if (empRes.success) {
        setEmployees(empRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunChange = async (run) => {
    setSelectedRun(run);
    setLoading(true);
    try {
      const res = await payrollService.getPayrollRecords(run.id);
      if (res.success) {
        setRecords(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    setActionLoading(true);
    try {
      const res = await payrollService.runPayroll(selectedMonth);
      if (res.success) {
        alert(res.message);
        await loadData();
      } else {
        alert(res.message || 'Failed to run payroll.');
      }
    } catch (e) {
      alert(e.message || 'Error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this payroll run?')) return;
    setActionLoading(true);
    try {
      const res = await payrollService.approvePayroll(id);
      if (res.success) {
        alert(res.message);
        await loadData();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Confirm salary payment dispersion? This will mark all entries as PAID.')) return;
    setActionLoading(true);
    try {
      const res = await payrollService.markPaid(id);
      if (res.success) {
        alert(res.message);
        await loadData();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (id) => {
    if (!window.confirm('Reopen this payroll run? Existing payments will reset to draft.')) return;
    setActionLoading(true);
    try {
      const res = await payrollService.reopenPayroll(id);
      if (res.success) {
        alert(res.message);
        await loadData();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (records.length === 0) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Employee Name,Employee ID,Department,Basic Pay,Gross Salary,Deductions,Net Salary,Payment Status,Month\n';
    
    records.forEach(r => {
      const row = [
        r.Employee?.name || 'N/A',
        r.Employee?.id || 'N/A',
        r.Employee?.department || 'N/A',
        r.basicPay,
        r.grossSalary,
        r.deductions,
        r.netSalary,
        r.status,
        r.month
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payroll_${selectedRun?.month || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for dashboard summary cards
  const totalEmployeesCount = employees.length;
  const processedCount = selectedRun ? selectedRun.totalEmployees : 0;
  const totalCost = selectedRun ? selectedRun.netPayout : 0;
  const totalDeductions = selectedRun ? selectedRun.totalDeduction : 0;
  const totalGross = selectedRun ? selectedRun.totalSalary : 0;
  
  // Mock data for graphs mapping (payroll trends)
  const salaryTrendsData = runs.map(r => ({
    month: r.month,
    netPay: r.netPayout,
    deductions: r.totalDeduction,
    gross: r.totalSalary
  })).reverse();

  // Dept distribution mapping
  const deptData = React.useMemo(() => {
    const counts = {};
    records.forEach(r => {
      const dept = r.Employee?.department || 'Other';
      counts[dept] = (counts[dept] || 0) + r.netSalary;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [records]);

  // Filtering and sorting records
  const filteredRecords = records.filter(r => {
    const name = (r.Employee?.name || '').toLowerCase();
    const empId = String(r.Employee?.id || '').toLowerCase();
    const dept = (r.Employee?.department || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = name.includes(query) || empId.includes(query);
    const matchesDept = deptFilter === '' || dept === deptFilter.toLowerCase();
    const matchesStatus = statusFilter === '' || r.status === statusFilter;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'employeeName') {
      valA = a.Employee?.name || '';
      valB = b.Employee?.name || '';
    } else if (sortField === 'employeeId') {
      valA = a.Employee?.id || 0;
      valB = b.Employee?.id || 0;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* Run Payroll Top Action Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational Payroll Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Select billing month cycle to trigger or inspect processing logs.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
          />
          {isHR && (
            <button 
              onClick={handleRunPayroll}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-500/10 hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={actionLoading ? 'animate-spin' : ''} />
              Run Payroll
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Cost */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm border border-slate-700/50 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Cost</span>
            <span className="p-1.5 bg-slate-700/50 rounded-lg text-emerald-400"><DollarSign size={16} /></span>
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">₹{totalCost.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-slate-400 block mt-1">Processed: ₹{totalGross.toLocaleString('en-IN')} Gross</span>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Deductions</span>
            <span className="p-1.5 bg-rose-50 text-rose-500 rounded-lg"><CreditCard size={16} /></span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">₹{totalDeductions.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-slate-400 block mt-1">Tax, PF, ESI, and LOP bounds</span>
          </div>
        </div>

        {/* Processed Count */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Employees</span>
            <span className="p-1.5 bg-sky-50 text-sky-500 rounded-lg"><Users size={16} /></span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{processedCount} / {totalEmployeesCount}</h3>
            <span className="text-[10px] text-slate-400 block mt-1">Salary structures configured</span>
          </div>
        </div>

        {/* Payment State */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cycle Status</span>
            <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><Clock size={16} /></span>
          </div>
          <div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block border ${
              selectedRun?.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              selectedRun?.status === 'Approved' ? 'bg-sky-50 text-sky-700 border-sky-100' :
              'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              {selectedRun ? selectedRun.status.toUpperCase() : 'NO ACTIVE RUN'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1.5">Cycle: {selectedRun?.month || 'N/A'}</span>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      {salaryTrendsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Salary Trend chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm md:col-span-8">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Salary Outflow Trend</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salaryTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="netPay" stroke="#0ea5e9" strokeWidth={2.5} name="Net Salary Payout" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="gross" stroke="#8b5cf6" strokeWidth={1.5} name="Gross Salary" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm md:col-span-4 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department Outflow</h4>
            <div className="h-[180px] flex items-center justify-center">
              {deptData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-400">No data available</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-500 mt-2">
              {deptData.map((d, index) => (
                <span key={index} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {d.name} ({Math.round((d.value / totalCost) * 100) || 0}%)
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Main Runs & Records Table Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        
        {/* Run Selector header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-800">Payroll Run Register</h3>
            <select 
              value={selectedRun?.id || ''}
              onChange={(e) => {
                const r = runs.find(run => run.id === Number(e.target.value));
                if (r) handleRunChange(r);
              }}
              className="border border-slate-200 bg-slate-50/50 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
            >
              {runs.map(run => (
                <option key={run.id} value={run.id}>Cycle: {run.month} ({run.status})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              <Download size={14} /> Export CSV
            </button>

            {selectedRun?.status === 'Draft' && isHR && (
              <button 
                onClick={() => handleApprove(selectedRun.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-xl text-xs font-bold shadow hover:bg-sky-600"
              >
                <CheckCircle2 size={14} /> Submit for Approval
              </button>
            )}

            {selectedRun?.status === 'Pending Approval' && isFinance && (
              <button 
                onClick={() => handleApprove(selectedRun.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-600"
              >
                <CheckCircle2 size={14} /> Approve Run
              </button>
            )}

            {selectedRun?.status === 'Approved' && isFinance && (
              <button 
                onClick={() => handleMarkPaid(selectedRun.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700"
              >
                <Landmark size={14} /> Mark Paid & Disburse
              </button>
            )}

            {selectedRun?.status === 'Paid' && isHR && (
              <button 
                onClick={() => handleReopen(selectedRun.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Reopen Run
              </button>
            )}
          </div>
        </div>

        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Search by Employee ID or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-700"
          />

          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold text-slate-600"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Management">Management</option>
            <option value="Quality Assurance">Quality Assurance</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold text-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {/* Data Table Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Employee Name</th>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Department</th>
                <th className="p-3">Gross Salary</th>
                <th className="p-3">Deductions</th>
                <th className="p-3">Bonus</th>
                <th className="p-3">Net Salary</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 uppercase font-mono tracking-widest animate-pulse">
                    Retrieving Payroll Records...
                  </td>
                </tr>
              ) : paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-700">{rec.Employee?.name}</td>
                    <td className="p-3 font-mono font-bold text-slate-500">#{rec.Employee?.id}</td>
                    <td className="p-3 text-slate-500">{rec.Employee?.department}</td>
                    <td className="p-3 font-bold text-slate-600">₹{rec.grossSalary.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-rose-500">₹{rec.deductions.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-emerald-500">₹{rec.bonus.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-extrabold text-sky-600">₹{rec.netSalary.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        rec.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        rec.status === 'Approved' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => window.open(`/api/payslips/${rec.id}`, '_blank')}
                        className="p-1 text-sky-500 hover:text-sky-700 transition-colors"
                        title="Generate Payslip"
                      >
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    No matching payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-400 font-semibold">
              Showing page {currentPage} of {totalPages} ({sortedRecords.length} entries)
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default PayrollProcessing;