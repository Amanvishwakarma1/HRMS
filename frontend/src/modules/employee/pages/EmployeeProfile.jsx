import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, CreditCard, Briefcase, FileText, Printer, 
  Download, ArrowLeft, Calendar, DollarSign, 
  CheckCircle, Landmark, ShieldCheck 
} from 'lucide-react';
import { employeeService } from '../services/employeeService';
import ThreeDCard from '../../../components/ThreeDCard';

// Indian currency number-to-words helper
const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numVal = Math.floor(Number(num));
  if (numVal === 0) return 'Zero Rupees Only';
  if (numVal.toString().length > 9) return 'Value limit exceeded';

  let n = ('000000000' + numVal).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
  return str.trim();
};

export const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load employee details
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      const response = await employeeService.getEmployeeById(id);
      if (response.success) {
        setEmployee(response.data);
      }
      setIsLoading(false);
    };
    fetchDetails();
  }, [id]);

  if (isLoading) {
    return <p style={{ padding: '24px', color: '#64748b', fontWeight: '600' }}>Loading employee profile...</p>;
  }

  if (!employee) {
    return (
      <div style={{ padding: '24px' }}>
        <button onClick={() => navigate('/employees')} className="tactile-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(15, 23, 42, 0.05)', border: '1px solid transparent', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Employees
        </button>
        <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Employee not found.</p>
      </div>
    );
  }

  // Pre-configured structured profile templates mapped by ID or auto-generated based on role
  const profileDetails = {
    salary: {
      basic: employee.id === 'EMP-001' ? 37500 : (employee.name === 'Aditya Mishra' ? 10500.50 : 25000),
      hra: employee.id === 'EMP-001' ? 22500 : (employee.name === 'Aditya Mishra' ? 6300.25 : 15000),
      allowance: employee.id === 'EMP-001' ? 15000 : (employee.name === 'Aditya Mishra' ? 4200.25 : 10000),
      pfEmployee: employee.id === 'EMP-001' ? 6300 : (employee.name === 'Aditya Mishra' ? 1764.00 : 4200),
      professionalTax: 208.00,
    },
    bank: {
      paymentMode: 'Bank Transfer',
      bankName: employee.id === 'EMP-001' ? 'HDFC Bank' : 'State Bank of India',
      accountNum: employee.id === 'EMP-001' ? '50100234567891' : '30456789120',
      ifsc: employee.id === 'EMP-001' ? 'HDFC0000123' : 'SBIN0000301',
      pan: employee.id === 'EMP-001' ? 'ABCDE1234F' : 'N/A',
      uan: employee.id === 'EMP-001' ? '100987654321' : 'N/A',
      pfNum: employee.id === 'EMP-001' ? 'MH/BAN/0012345/000/0078901' : 'N/A'
    },
    documents: [
      { name: 'Aadhaar Card.pdf', size: '1.2 MB', date: '12 May 2026' },
      { name: 'PAN Card.pdf', size: '0.8 MB', date: '12 May 2026' },
      { name: 'Highest Degree Certificate.pdf', size: '2.5 MB', date: '15 May 2026' }
    ]
  };

  // Calculations for payslip
  const totalEarnings = profileDetails.salary.basic + profileDetails.salary.hra + profileDetails.salary.allowance;
  const totalDeductions = profileDetails.salary.pfEmployee + profileDetails.salary.professionalTax;
  const netSalary = totalEarnings - totalDeductions;

  const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(15, 23, 42, 0.05)', border: '1px solid transparent', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s' },
    profileHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '32px' },
    headerInfo: { display: 'flex', alignItems: 'center', gap: '24px' },
    avatar: { width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)' },
    tabNav: { display: 'flex', gap: '8px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', paddingBottom: '8px', marginBottom: '24px' },
    tabBtn: (active) => ({ padding: '10px 20px', background: active ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' : 'transparent', border: active ? '1px solid rgba(15, 23, 42, 0.15)' : '1px solid transparent', color: '#0f172a', fontWeight: active ? '700' : '500', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }),
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' },
    infoLabel: { color: '#64748b', fontSize: '14px', fontWeight: '500' },
    infoVal: { color: '#0f172a', fontSize: '14px', fontWeight: '600' },
    docCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '12px', marginBottom: '12px', background: 'rgba(255, 255, 255, 0.3)' },
    generateBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.25)' },
    
    // Payslip modal overlay
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', overflowY: 'auto', padding: '40px 0' },
    
    // Reference Image Payslip Sheet Layout
    payslipContainer: { width: '800px', backgroundColor: '#ffffff', color: '#000000', padding: '40px', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', height: 'fit-content' }
  };

  return (
    <div style={styles.container}>
      {/* Dynamic Printing Style Injector to isolate Payslip container during print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-payslip-sheet, #print-payslip-sheet * {
            visibility: visible !important;
          }
          #print-payslip-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 30px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Back button */}
      <button 
        onClick={() => navigate('/employees')} 
        className="tactile-btn" 
        style={styles.backBtn}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.08)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.05)'}
      >
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.headerInfo}>
          <div style={styles.avatar}>
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>{employee.name}</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} color="#0ea5e9" /> {employee.designation} &bull; <Landmark size={16} color="#8b5cf6" /> {employee.department}
            </p>
          </div>
        </div>

        {/* Generate Payslip Action */}
        <button 
          className="tactile-btn" 
          style={styles.generateBtn}
          onClick={() => setIsPayslipModalOpen(true)}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0284c7'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#0ea5e9'}
        >
          <FileText size={18} /> Generate Payslip
        </button>
      </div>

      {/* Tab sub-navigation inside Profile */}
      <div style={styles.tabNav}>
        <button style={styles.tabBtn(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Profile Overview</button>
        <button style={styles.tabBtn(activeTab === 'salary')} onClick={() => setActiveTab('salary')}>Salary & Bank Details</button>
        <button style={styles.tabBtn(activeTab === 'documents')} onClick={() => setActiveTab('documents')}>Documents ({profileDetails.documents.length})</button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div style={styles.cardGrid}>
          <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#0ea5e9" /> Primary Details
              </h3>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Employee ID</span><span style={styles.infoVal}>{employee.id}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Full Name</span><span style={styles.infoVal}>{employee.name}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Official Email</span><span style={styles.infoVal}>{employee.email}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Joined Date</span><span style={styles.infoVal}>{employee.joinDate || 'N/A'}</span></div>
            </div>
          </ThreeDCard>

          <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="#8b5cf6" /> Organizational Info
              </h3>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Department</span><span style={styles.infoVal}>{employee.department}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Job Position</span><span style={styles.infoVal}>{employee.designation}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Employment Status</span><span style={styles.infoVal}><span style={{ padding: '4px 8px', backgroundColor: employee.status === 'Active' ? '#d1fae5' : '#fef3c7', color: employee.status === 'Active' ? '#065f46' : '#92400e', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>{employee.status}</span></span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Working Location</span><span style={styles.infoVal}>Noida Head Office</span></div>
            </div>
          </ThreeDCard>
        </div>
      )}

      {activeTab === 'salary' && (
        <div style={styles.cardGrid}>
          <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="#10b981" /> Salary Components
              </h3>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Basic Pay</span><span style={styles.infoVal}>₹{profileDetails.salary.basic.toLocaleString('en-IN')}.00</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>House Rent Allowance (HRA)</span><span style={styles.infoVal}>₹{profileDetails.salary.hra.toLocaleString('en-IN')}.00</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Other Allowances</span><span style={styles.infoVal}>₹{profileDetails.salary.allowance.toLocaleString('en-IN')}.00</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>PF Contribution</span><span style={styles.infoVal}>₹{profileDetails.salary.pfEmployee.toLocaleString('en-IN')}.00</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Net Payout (A-B-C)</span><span style={{ ...styles.infoVal, color: '#10b981', fontSize: '16px', fontWeight: '800' }}>₹{netSalary.toLocaleString('en-IN')}.00</span></div>
            </div>
          </ThreeDCard>

          <ThreeDCard depth="20px" style={{ borderRadius: '20px' }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#f59e0b" /> Bank & Statutory Details
              </h3>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Bank Name</span><span style={styles.infoVal}>{profileDetails.bank.bankName}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>Account Number</span><span style={styles.infoVal}>{profileDetails.bank.accountNum}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>IFSC Code</span><span style={styles.infoVal}>{profileDetails.bank.ifsc}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>UAN Code</span><span style={styles.infoVal}>{profileDetails.bank.uan}</span></div>
              <div style={styles.infoRow}><span style={styles.infoLabel}>PAN Code</span><span style={styles.infoVal}>{profileDetails.bank.pan}</span></div>
            </div>
          </ThreeDCard>
        </div>
      )}

      {activeTab === 'documents' && (
        <ThreeDCard depth="15px" style={{ borderRadius: '20px' }}>
          <div style={{ padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#8b5cf6" /> Submitted Documents
            </h3>
            {profileDetails.documents.map((doc, idx) => (
              <div key={idx} style={styles.docCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} color="#64748b" />
                  <div>
                    <div style={{ fontWeight: '700', color: '#334155', fontSize: '14px' }}>{doc.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Uploaded on {doc.date} &bull; {doc.size}</div>
                  </div>
                </div>
                <button className="tactile-btn" style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </ThreeDCard>
      )}

      {/* Payslip Generator Print-Ready Modal Sheet */}
      {isPayslipModalOpen && (
        <div style={styles.modalOverlay} className="no-print-overlay" onClick={() => setIsPayslipModalOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={e => e.stopPropagation()}>
            
            {/* Action Buttons Panel */}
            <div className="no-print" style={{ width: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setIsPayslipModalOpen(false)}
                className="tactile-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '10px', color: 'white', fontWeight: '700', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} /> Close Modal
              </button>
              
              <button 
                onClick={() => window.print()}
                className="tactile-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#10b981', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              >
                <Printer size={16} /> Print Payslip
              </button>
            </div>

            {/* Print Sheet Container (Directly matches the provided image specification) */}
            <div id="print-payslip-sheet" style={styles.payslipContainer}>
              
              {/* Outer border & Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #000000', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ maxWidth: '480px' }}>
                  {/* Company address exact specification */}
                  <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5', color: '#1e293b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                    34, THIRD FLOOR, BLOCK-2, SIDCO<br />
                    ELECTRONIC COMPLEX, GUINDY<br />
                    INDUSTRIAL ESTATE..., CHENNAI, TAMIL<br />
                    NADU, 600032
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {/* Brand logo place */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: '#ea580c', fontWeight: 'bold', fontSize: '16px' }}>
                    <span style={{ fontSize: '22px' }}>▲</span>
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <h2 style={{ fontSize: '18px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {employee.name}
              </h2>

              {/* Employee Metadata Details (Grid format) */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '10px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 4px', width: '25%' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>Employee Number</span>
                      <strong style={{ color: '#0f172a' }}>{employee.id === 'EMP-001' ? 'HMPL110' : employee.id}</strong>
                    </td>
                    <td style={{ padding: '8px 4px', width: '25%' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>Date Joined</span>
                      <strong style={{ color: '#0f172a' }}>{employee.joinDate || '27 Apr 2026'}</strong>
                    </td>
                    <td style={{ padding: '8px 4px', width: '25%' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>Department</span>
                      <strong style={{ color: '#0f172a' }}>{employee.department === 'Engineering' ? 'Management' : employee.department}</strong>
                    </td>
                    <td style={{ padding: '8px 4px', width: '25%' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>Sub Department</span>
                      <strong style={{ color: '#0f172a' }}>N/A</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>Designation</span>
                      <strong style={{ color: '#0f172a' }}>{employee.designation === 'Frontend Developer' ? 'Project Coordinator' : employee.designation}</strong>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>Payment Mode</span>
                      <strong style={{ color: '#0f172a' }}>{profileDetails.bank.paymentMode}</strong>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>UAN</span>
                      <strong style={{ color: '#0f172a' }}>{profileDetails.bank.uan}</strong>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>PF Number</span>
                      <strong style={{ color: '#0f172a' }}>{profileDetails.bank.pfNum}</strong>
                    </td>
                  </tr>
                  <tr style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 4px' }} colSpan={4}>
                      <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>PAN Number</span>
                      <strong style={{ color: '#0f172a' }}>{profileDetails.bank.pan}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* SALARY ATTENDANCE DETAILS HEADER */}
              <h3 style={{ fontSize: '11px', fontWeight: '800', margin: '0 0 10px 0', textTransform: 'uppercase', borderBottom: '1.5px solid #000000', paddingBottom: '4px' }}>
                Salary Details
              </h3>

              {/* Attendance days grid */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px', color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', fontWeight: 'bold' }}>Actual Payable Days</th>
                    <th style={{ textAlign: 'left', padding: '6px 4px', color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', fontWeight: 'bold' }}>Total Working Days</th>
                    <th style={{ textAlign: 'left', padding: '6px 4px', color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', fontWeight: 'bold' }}>Loss of Pay Days</th>
                    <th style={{ textAlign: 'left', padding: '6px 4px', color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', fontWeight: 'bold' }}>Days Payable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>31</td>
                    <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>31</td>
                    <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>0</td>
                    <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>31</td>
                  </tr>
                </tbody>
              </table>

              {/* Earnings & Deductions Details splits */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', fontSize: '11px', marginBottom: '32px' }}>
                
                {/* Earnings Column */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#1e293b' }}>
                    Earnings
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0', color: '#334155' }}>Basic</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>{profileDetails.salary.basic.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: '#334155' }}>HRA</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>{profileDetails.salary.hra.toFixed(2)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 0', color: '#334155' }}>Other Allowance</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>{profileDetails.salary.allowance.toFixed(2)}</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold' }}>
                        <td style={{ padding: '8px 0', color: '#0f172a' }}>Total Earnings (A)</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>{totalEarnings.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Contributions and Deductions Column */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#1e293b' }}>
                    Contributions
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0', color: '#334155' }}>PF Employee</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>{profileDetails.salary.pfEmployee.toFixed(2)}</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold', borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 0', color: '#0f172a' }}>Total Contributions (B)</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>{profileDetails.salary.pfEmployee.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 style={{ margin: '16px 0 10px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#1e293b' }}>
                    Taxes & Deductions
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0', color: '#334155' }}>Professional Tax</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>{profileDetails.salary.professionalTax.toFixed(2)}</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold', borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 0', color: '#0f172a' }}>Total Taxes & Deductions (C)</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>{profileDetails.salary.professionalTax.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Total payout calculations sheet */}
              <div style={{ borderTop: '1.5px solid #000000', paddingTop: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Net Salary Payable ( A - B - C )</span>
                  <span style={{ fontSize: '13px' }}>{netSalary.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '10px' }}>
                  <span>Net Salary in words</span>
                  <span style={{ fontWeight: 'bold', color: '#475569' }}>{numberToWords(netSalary)}</span>
                </div>
              </div>

              {/* Bottom footnotes statement */}
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '24px', paddingTop: '12px', fontSize: '8.5px', color: '#64748b', fontStyle: 'italic' }}>
                *Note : All amounts displayed in this payslip are in INR
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeProfile;
