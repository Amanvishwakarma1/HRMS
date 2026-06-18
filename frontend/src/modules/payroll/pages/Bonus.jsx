import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, X, Check, CheckCircle2, AlertCircle, RefreshCw, Trash2, ShieldCheck
} from 'lucide-react';
import payrollService from '../services/payrollService';

export const Bonus = () => {
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeIds: [], // for bulk assign
    amount: 5000,
    type: 'Festival Bonus',
    month: '2026-06',
    description: ''
  });

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };
  const userRole = storedUser.role.toLowerCase();
  const isFinance = userRole === 'finance' || userRole === 'admin';
  const isHR = userRole === 'hr' || userRole === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getBonuses();
      if (res.success) {
        setBonuses(res.data);
      }
      const empRes = await payrollService.getEmployees();
      if (empRes.success) {
        setEmployees(empRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleBulkEmployeeToggle = (empId) => {
    setFormData(prev => {
      const ids = [...prev.employeeIds];
      const idx = ids.indexOf(empId);
      if (idx !== -1) {
        ids.splice(idx, 1);
      } else {
        ids.push(empId);
      }
      return { ...prev, employeeIds: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let res;
      if (bulkMode) {
        if (formData.employeeIds.length === 0) {
          alert('Select at least one employee for bulk assign.');
          setActionLoading(false);
          return;
        }
        res = await payrollService.bulkAssignBonus(formData);
      } else {
        if (!formData.employeeId) {
          alert('Select an employee.');
          setActionLoading(false);
          return;
        }
        res = await payrollService.createBonus(formData);
      }

      if (res.success) {
        alert(res.message);
        setModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this bonus as ${status.toLowerCase()}?`)) return;
    try {
      const res = await payrollService.approveBonus(id, status);
      if (res.success) {
        alert(res.message);
        loadData();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this bonus assign?')) return;
    try {
      const res = await payrollService.deleteBonus(id);
      if (res.success) {
        alert(res.message);
        loadData();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions Panel */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bonus Register Management</h2>
          <p className="text-xs text-slate-400 mt-1">Assign festival, performance, and retention incentives to employees.</p>
        </div>
        
        {isHR && (
          <button 
            onClick={() => {
              setBulkMode(false);
              setFormData({ employeeId: '', employeeIds: [], amount: 5000, type: 'Festival Bonus', month: '2026-06', description: '' });
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-500/10 hover:bg-sky-600 transition-colors"
          >
            <Plus size={16} /> Assign Bonus
          </button>
        )}
      </div>

      {/* Bonuses Register Grid Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-3">Employee Name</th>
              <th className="p-3">Bonus Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Cycle Month</th>
              <th className="p-3">Status</th>
              <th className="p-3">Description</th>
              {isFinance && <th className="p-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 uppercase font-mono tracking-widest animate-pulse">
                  Querying Bonus Logs...
                </td>
              </tr>
            ) : bonuses.length > 0 ? (
              bonuses.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-slate-700">{b.Employee?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">#{b.Employee?.id} &bull; {b.Employee?.department}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-600">{b.type}</td>
                  <td className="p-3 font-bold text-emerald-500">₹{b.amount.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-semibold text-slate-500">{b.month}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      b.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      b.status === 'Approved' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                      b.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{b.description || '--'}</td>
                  
                  {isFinance && (
                    <td className="p-3 text-right space-x-1.5">
                      {b.status === 'Pending Approval' ? (
                        <>
                          <button onClick={() => handleApprove(b.id, 'Approved')} className="p-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100" title="Approve">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleApprove(b.id, 'Rejected')} className="p-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100" title="Reject">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleDelete(b.id)} className="p-1 text-rose-500 hover:text-rose-700" title="Remove Record">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No bonuses assigned. Click "Assign Bonus" to set incentives.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {bulkMode ? 'Bulk Assign Incentive Bonus' : 'Assign Incentive Bonus'}
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setBulkMode(!bulkMode)} 
                  className="text-xs text-sky-500 font-bold hover:underline"
                >
                  {bulkMode ? 'Switch Single' : 'Switch Bulk'}
                </button>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {!bulkMode ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Select Employee</label>
                  <select 
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    className="w-full text-xs border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold text-slate-800"
                  >
                    <option value="">Choose employee...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} (#{e.id})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Select Target Employees ({formData.employeeIds.length})</label>
                  <div className="border border-slate-200 rounded-xl max-h-[150px] overflow-y-auto p-2.5 space-y-2">
                    {employees.map(e => (
                      <label key={e.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.employeeIds.includes(e.id)} 
                          onChange={() => handleBulkEmployeeToggle(e.id)} 
                          className="rounded text-sky-500 focus:ring-sky-500"
                        />
                        {e.name} (#{e.id})
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Amount</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Cycle Month</label>
                  <input type="month" name="month" value={formData.month} onChange={handleInputChange} className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Bonus Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full text-xs border border-slate-200 rounded-xl p-2.5">
                  <option value="Festival Bonus">Festival Bonus</option>
                  <option value="Performance Bonus">Performance Bonus</option>
                  <option value="Retention Bonus">Retention Bonus</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Incentive Description</label>
                <input 
                  type="text" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Eid/Diwali allowance, Q1 KPI excellence"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={actionLoading} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50">
                  {actionLoading ? 'Assigning...' : 'Assign Incentive Bonus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bonus;