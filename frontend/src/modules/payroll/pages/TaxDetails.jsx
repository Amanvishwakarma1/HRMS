import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, FileText, Upload, Plus, Check, X, FileSpreadsheet, Percent, Landmark
} from 'lucide-react';
import payrollService from '../services/payrollService';

export const TaxDetails = () => {
  const [declarations, setDeclarations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('declare');

  // Submit Declaration Form
  const [formData, setFormData] = useState({
    financialYear: '2026-2027',
    category: '80C',
    amount: 10000,
    proofUrl: ''
  });

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'Employee', role: 'employee' };
  const isHR = storedUser.role.toLowerCase() === 'hr' || storedUser.role.toLowerCase() === 'admin' || storedUser.role.toLowerCase() === 'finance';

  const loadData = async () => {
    setLoading(true);
    try {
      const decRes = await payrollService.getTaxDeclarations();
      if (decRes.success) {
        setDeclarations(decRes.data);
      }
      if (isHR) {
        const empRes = await payrollService.getEmployees();
        if (empRes.success) {
          setEmployees(empRes.data);
          if (empRes.data.length > 0) {
            setSelectedEmp(empRes.data[0].id);
          }
        }
      } else {
        setSelectedEmp(storedUser.id || 4); // Default employee ID
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

  // Fetch yearly slab projections
  useEffect(() => {
    if (selectedEmp) {
      payrollService.getTaxReport(selectedEmp, financialYear).then(res => {
        if (res.success) {
          setReport(res.data);
        }
      });
    }
  }, [selectedEmp, financialYear, declarations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await payrollService.createTaxDeclaration(formData);
      if (res.success) {
        alert(res.message);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      const res = await payrollService.approveTaxDeclaration(id, status);
      if (res.success) {
        alert(res.message);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tax declaration?')) return;
    try {
      const res = await payrollService.deleteTaxDeclaration(id);
      if (res.success) {
        alert(res.message);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigators */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tax Declarations & Projection</h2>
          <p className="text-xs text-slate-400 mt-1">Submit investment declarations, upload proofs, and compute annual TDS slabs.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('declare')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'declare' ? 'bg-sky-500 text-white shadow' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
          >
            Submit Declarations
          </button>
          {isHR && (
            <button 
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'review' ? 'bg-sky-500 text-white shadow' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
            >
              Verify Declarations ({declarations.filter(d => d.status === 'Pending').length})
            </button>
          )}
          <button 
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'report' ? 'bg-sky-500 text-white shadow' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
          >
            Yearly Projections
          </button>
        </div>
      </div>

      {activeTab === 'declare' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Declaration form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2">New Declaration</h3>
            
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Financial Year</label>
                <select name="financialYear" value={formData.financialYear} onChange={handleInputChange} className="w-full text-xs border border-slate-200 rounded-xl p-2.5">
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Category Code</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full text-xs border border-slate-200 rounded-xl p-2.5">
                  <option value="80C">Section 80C (PPF, LIC, ELSS - Limit 1.5L)</option>
                  <option value="80D">Section 80D (Medical Insurance - Limit 25k)</option>
                  <option value="HRA">HRA Exemption (Rent Receipts)</option>
                  <option value="NPS">NPS Contribution (Limit 50k)</option>
                  <option value="Home Loan">Home Loan Interest</option>
                  <option value="Education Loan">Education Loan Interest</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Declared Investment Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Proof URL / Attachment</label>
                <input type="text" name="proofUrl" value={formData.proofUrl} onChange={handleInputChange} placeholder="Link to receipt pdf or image copy" className="w-full text-xs border border-slate-200 rounded-xl p-2.5" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold shadow hover:bg-sky-600 transition-colors">
                Submit Declaration
              </button>
            </form>
          </div>

          {/* User's past declarations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-8 overflow-x-auto">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">My Declared Investments</h3>
            
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-3">Financial Year</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Declared Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date Submitted</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {declarations.filter(d => d.employeeId === (storedUser.id || 4)).map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-700">{d.financialYear}</td>
                    <td className="p-3 text-slate-500">{d.category}</td>
                    <td className="p-3 font-bold text-slate-600">₹{d.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        d.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(d.declarationDate).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {d.status === 'Pending' && (
                        <button onClick={() => handleDelete(d.id)} className="text-rose-500 hover:text-rose-700">
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {declarations.filter(d => d.employeeId === (storedUser.id || 4)).length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">No declarations filed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeTab === 'review' && isHR && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Pending Declarations Verification Dashboard</h3>
          
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="p-3">Employee</th>
                <th className="p-3">Financial Year</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Proof copy</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {declarations.filter(d => d.status === 'Pending').map((d) => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-slate-700">{d.Employee?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">#{d.Employee?.id} &bull; {d.Employee?.department}</div>
                  </td>
                  <td className="p-3 text-slate-500">{d.financialYear}</td>
                  <td className="p-3 font-semibold text-slate-600">{d.category}</td>
                  <td className="p-3 font-bold text-slate-700">₹{d.amount.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    {d.proofUrl ? (
                      <a href={d.proofUrl} target="_blank" rel="noreferrer" className="text-sky-500 font-bold flex items-center gap-1 hover:underline">
                        <FileText size={14} /> View Document
                      </a>
                    ) : <span className="text-slate-400 font-semibold italic">No proof attached</span>}
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button onClick={() => handleApprove(d.id, 'Approved')} className="p-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleApprove(d.id, 'Rejected')} className="p-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100">
                      <X size={14} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
              {declarations.filter(d => d.status === 'Pending').length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">All submissions verified! No pending declarations.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estimated Slabs & Tax Projections</h3>
            
            <div className="flex items-center gap-2">
              {isHR && (
                <select 
                  value={selectedEmp} 
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  className="border border-slate-200 bg-slate-50/50 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} (#{e.id})</option>
                  ))}
                </select>
              )}
              <select 
                value={financialYear} 
                onChange={(e) => setFinancialYear(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>
          </div>

          {report ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Summary Projection Sheet */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-bold">Annual Gross Base Pay:</span>
                    <span className="font-extrabold text-slate-800">₹{report.annualGross.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-bold">Approved Deductions (Total):</span>
                    <span className="font-extrabold text-rose-500">₹{report.totalAllowableDeductions.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2 bg-sky-50/50 p-1.5 rounded-lg">
                    <span className="text-sky-700 font-extrabold">Net Taxable Income:</span>
                    <span className="font-black text-sky-800">₹{report.netTaxableIncome.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-bold">Estimated Annual Tax Slab:</span>
                    <span className="font-extrabold text-slate-800">₹{report.estimatedAnnualTax.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-slate-800 text-sm">
                    <span className="text-emerald-700">Estimated Monthly TDS Deduction:</span>
                    <span className="font-black text-emerald-800">₹{report.estimatedMonthlyTDS.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                <div className="bg-sky-50/30 border border-sky-100 rounded-xl p-4 text-[10px] text-sky-700 space-y-1.5 leading-relaxed">
                  <span className="font-extrabold block text-xs mb-1">💡 Tax Computation Rules applied:</span>
                  - Slab rates follow New Tax Regime allocations: up to 3L (NIL), 3L-6L (5%), 6L-9L (10%), 9L-12L (15%), 12L-15L (20%), 15L+ (30%).
                  - Deductions include Section 80C, 80D, HRA exemption limits, NPS pension options, and loan interest components verified by HR.
                </div>
              </div>

              {/* Deductions breakdown */}
              <div className="md:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2">Allowable Deductions Breakdown</h4>
                
                <div className="space-y-2.5 text-xs">
                  {Object.keys(report.allowableDeductions).map((key) => (
                    <div key={key} className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400 font-semibold">{key} Allowance:</span>
                      <span className="font-bold text-slate-700">₹{report.allowableDeductions[key].toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Loading projection calculations sheet...</p>
          )}
        </div>
      )}

    </div>
  );
};

export default TaxDetails;