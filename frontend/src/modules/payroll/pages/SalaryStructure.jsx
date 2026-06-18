import React, { useState, useEffect } from 'react';
import { 
  Users, Copy, Edit2, Trash2, History, Plus, X, CheckCircle, FileSpreadsheet, Landmark, ArrowRight
} from 'lucide-react';
import payrollService from '../services/payrollService';

export const SalaryStructure = () => {
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeEmpName, setActiveEmpName] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    id: null,
    employeeId: '',
    basicPay: 20000,
    hra: 10000,
    conveyance: 1600,
    medical: 1250,
    specialAllowance: 5000,
    otherAllowance: 3000,
    pf: 2400,
    esi: 0,
    professionalTax: 200,
    changeReason: ''
  });

  const [cloneData, setCloneData] = useState({
    sourceEmployeeId: '',
    targetEmployeeId: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const structRes = await payrollService.getSalaryStructures();
      if (structRes.success) {
        setStructures(structRes.data);
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

  const openAddModal = () => {
    setFormData({
      id: null,
      employeeId: '',
      basicPay: 25000,
      hra: 10000,
      conveyance: 2000,
      medical: 1500,
      specialAllowance: 5000,
      otherAllowance: 3000,
      pf: 3000,
      esi: 0,
      professionalTax: 200,
      changeReason: 'Initial setup'
    });
    setModalOpen(true);
  };

  const openEditModal = (struct) => {
    setFormData({
      id: struct.id,
      employeeId: struct.employeeId,
      basicPay: struct.basicPay,
      hra: struct.hra,
      conveyance: struct.conveyance,
      medical: struct.medical,
      specialAllowance: struct.specialAllowance,
      otherAllowance: struct.otherAllowance,
      pf: struct.pf,
      esi: struct.esi,
      professionalTax: struct.professionalTax,
      changeReason: ''
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employeeId' || name === 'changeReason' ? value : parseFloat(value) || 0
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (formData.id) {
        res = await payrollService.updateSalaryStructure(formData.id, formData);
      } else {
        res = await payrollService.createSalaryStructure(formData);
      }
      
      if (res.success) {
        alert(res.message);
        setModalOpen(false);
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to save salary structure');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this salary structure? This cannot be undone.')) return;
    try {
      const res = await payrollService.deleteSalaryStructure(id);
      if (res.success) {
        alert(res.message);
        loadData();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleClone = async (e) => {
    e.preventDefault();
    if (!cloneData.sourceEmployeeId || !cloneData.targetEmployeeId) {
      alert('Select source and target employees.');
      return;
    }
    try {
      const res = await payrollService.cloneSalaryStructure(cloneData);
      if (res.success) {
        alert(res.message);
        setCloneModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewHistory = async (empId, empName) => {
    setActiveEmpName(empName);
    try {
      const res = await payrollService.getRevisionHistory(empId);
      if (res.success) {
        setHistory(res.data);
        setHistoryOpen(true);
      }
    } catch (e) {
      alert('Failed to fetch salary revision logs');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Add Actions panel */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Salary Structures Configuration</h2>
          <p className="text-xs text-slate-400 mt-1">Configure employee base earnings, tax slabs, and cloned structures.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCloneModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-slate-50/50 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-600 transition-colors"
          >
            <Copy size={16} /> Clone
          </button>
          
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-500/10 hover:bg-sky-600 transition-colors"
          >
            <Plus size={16} /> Create Structure
          </button>
        </div>
      </div>

      {/* Main Structures Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-3">Employee Name</th>
              <th className="p-3">Basic Pay</th>
              <th className="p-3">HRA</th>
              <th className="p-3">Special Allowance</th>
              <th className="p-3">Deductions (PF+PT)</th>
              <th className="p-3">Gross Salary</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 uppercase font-mono tracking-widest animate-pulse">
                  Querying Salary Structures...
                </td>
              </tr>
            ) : structures.length > 0 ? (
              structures.map((s) => {
                const gross = s.basicPay + s.hra + s.conveyance + s.medical + s.specialAllowance + s.otherAllowance;
                const deductions = s.pf + s.professionalTax + s.esi;
                return (
                  <tr key={s.id} className="border-b border-slate-5 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-700">{s.Employee?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">#{s.Employee?.id} &bull; {s.Employee?.designation}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">₹{s.basicPay.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-600">₹{s.hra.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-600">₹{s.specialAllowance.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-rose-500 font-bold">₹{deductions.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-extrabold text-sky-600">₹{gross.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right space-x-1.5">
                      <button 
                        onClick={() => handleViewHistory(s.employeeId, s.Employee?.name)}
                        className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                        title="Revision History"
                      >
                        <History size={16} />
                      </button>
                      <button 
                        onClick={() => openEditModal(s)}
                        className="p-1 text-sky-500 hover:text-sky-700 transition-colors"
                        title="Edit Structure"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                        title="Delete Structure"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No salary structures configured. Click "Create Structure" to configure.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Structure Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {formData.id ? 'Modify Salary Structure' : 'New Salary Structure'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              
              {!formData.id && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Select Employee</label>
                  <select 
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    className="w-full text-xs border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                  >
                    <option value="">Choose employee...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} (#{e.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Basic Pay</label>
                  <input type="number" name="basicPay" value={formData.basicPay} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">HRA</label>
                  <input type="number" name="hra" value={formData.hra} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Conveyance</label>
                  <input type="number" name="conveyance" value={formData.conveyance} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Medical</label>
                  <input type="number" name="medical" value={formData.medical} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Special Allowance</label>
                  <input type="number" name="specialAllowance" value={formData.specialAllowance} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">PF Employee</label>
                  <input type="number" name="pf" value={formData.pf} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">ESI</label>
                  <input type="number" name="esi" value={formData.esi} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">PTax</label>
                  <input type="number" name="professionalTax" value={formData.professionalTax} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Revision / Change Reason</label>
                <input 
                  type="text" 
                  name="changeReason" 
                  value={formData.changeReason} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Annual Appraisal, Promo, Correction"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors">
                  Save Salary Configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {cloneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Clone Salary Structure</h3>
              <button onClick={() => setCloneModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleClone} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Source Employee</label>
                <select 
                  value={cloneData.sourceEmployeeId}
                  onChange={(e) => setCloneData(prev => ({ ...prev, sourceEmployeeId: e.target.value }))}
                  required
                  className="w-full text-xs border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                >
                  <option value="">Select source...</option>
                  {structures.map(s => (
                    <option key={s.id} value={s.employeeId}>{s.Employee?.name} (Source)</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center text-slate-400">
                <ArrowRight size={20} />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Target Employee</label>
                <select 
                  value={cloneData.targetEmployeeId}
                  onChange={(e) => setCloneData(prev => ({ ...prev, targetEmployeeId: e.target.value }))}
                  required
                  className="w-full text-xs border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                >
                  <option value="">Select target...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} (Target)</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors">
                  Confirm Clone Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Revision History: {activeEmpName}</h3>
              <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 max-h-[350px] overflow-y-auto space-y-4">
              {history.length > 0 ? (
                history.map((h, index) => {
                  const gross = h.basicPay + h.hra + h.conveyance + h.medical + h.specialAllowance + h.otherAllowance;
                  return (
                    <div key={h.id} className="border border-slate-100 rounded-xl p-3.5 space-y-2 bg-slate-50/30">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">#{history.length - index} &bull; {new Date(h.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs font-extrabold text-sky-600">₹{gross.toLocaleString('en-IN')} Gross</span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold italic mt-1">"{h.changeReason || 'No details provided'}"</p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Basic: <b className="text-slate-600">₹{h.basicPay}</b></span>
                        <span>HRA: <b className="text-slate-600">₹{h.hra}</b></span>
                        <span>PF: <b className="text-slate-600">₹{h.pf}</b></span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No revisions found.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalaryStructure;