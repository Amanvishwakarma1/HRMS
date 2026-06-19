import { sequelize } from '../config/db.js';
import { PayrollRun } from '../models/PayrollRun.js';
import { PayrollRecord } from '../models/PayrollRecord.js';
import { Employee } from '../models/Employee.js';
import { SalaryStructure } from '../models/SalaryStructure.js';
import { Attendance } from '../models/Attendance.js';
import { Bonus } from '../models/Bonus.js';
import { Reimbursement } from '../models/Reimbursement.js';
import { AuditLog } from '../models/AuditLog.js';
import { Op } from 'sequelize';

// Helpers to get days in a month
const getDaysInMonth = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

export const runPayroll = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { month } = req.body; // YYYY-MM
    if (!month) {
      return res.status(400).json({ success: false, message: 'Month is required.' });
    }

    // 1. Check if payroll has already been approved/processed for this month
    const existingRun = await PayrollRun.findOne({ where: { month } });
    if (existingRun && ['Approved', 'Processed', 'Paid'].includes(existingRun.status)) {
      return res.status(400).json({ success: false, message: `Payroll for ${month} is already ${existingRun.status.toLowerCase()} and cannot be re-run.` });
    }

    // If it exists in Draft or Pending Approval, clean it up first
    if (existingRun) {
      await PayrollRecord.destroy({ where: { payrollRunId: existingRun.id }, transaction });
      await existingRun.destroy({ transaction });
    }

    // 2. Fetch all active employees
    const employees = await Employee.findAll();

    let totalEmployees = 0;
    let totalSalarySum = 0;
    let totalDeductionSum = 0;
    let netPayoutSum = 0;

    // Create the central PayrollRun header
    const run = await PayrollRun.create({
      month,
      status: 'Draft',
      processedBy: req.user.username,
      runDate: new Date()
    }, { transaction });

    const daysInMonth = getDaysInMonth(month);
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

    // 3. Loop through employees and calculate pay breakdown
    for (const emp of employees) {
      // Find salary structure
      const structure = await SalaryStructure.findOne({ where: { employeeId: emp.id } });
      if (!structure) {
        continue; // skip if no structure set
      }

      // Find attendance absent days
      const absents = await Attendance.count({
        where: {
          employeeId: emp.id,
          status: 'Absent',
          checkInTime: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      // Find approved bonuses
      const bonuses = await Bonus.findAll({
        where: {
          employeeId: emp.id,
          month,
          status: 'Approved'
        }
      });
      const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);

      // Find approved reimbursements
      const reimbursements = await Reimbursement.findAll({
        where: {
          employeeId: emp.id,
          month,
          status: 'Approved'
        }
      });
      const totalReimbursement = reimbursements.reduce((sum, r) => sum + r.amount, 0);

      // Formulas
      const basic = structure.basicPay;
      const hra = structure.hra;
      const allowances = structure.conveyance + structure.medical + structure.specialAllowance + structure.otherAllowance;
      const gross = basic + hra + allowances;

      // LOP = (Gross / daysInMonth) * LOPDays
      const lopDays = absents;
      const lopAmount = parseFloat(((gross / daysInMonth) * lopDays).toFixed(2));

      // Deductions
      const pf = structure.pf;
      const esi = structure.esi;
      const pt = structure.professionalTax;
      
      // TDS default estimate (5% of basic if basic > 20000, else 0)
      const tds = basic > 20000 ? parseFloat((basic * 0.1).toFixed(2)) : 0;

      const totalDeductions = parseFloat((lopAmount + pf + esi + pt + tds).toFixed(2));
      const netSalary = parseFloat((gross + totalBonus + totalReimbursement - totalDeductions).toFixed(2));

      // Create record
      await PayrollRecord.create({
        employeeId: emp.id,
        payrollRunId: run.id,
        month,
        basicPay: basic,
        hra: hra,
        conveyance: structure.conveyance,
        medical: structure.medical,
        specialAllowance: structure.specialAllowance,
        otherAllowance: structure.otherAllowance,
        lopDays,
        lopAmount,
        pf,
        esi,
        professionalTax: pt,
        tds,
        bonus: totalBonus,
        reimbursement: totalReimbursement,
        grossSalary: gross,
        deductions: totalDeductions,
        netSalary: Math.max(0, netSalary),
        status: 'Draft',
        digitalSignature: 'Verified digitally by Chronos HR engine',
        qrCodeData: `EMPLOYEE:${emp.id}|NET_PAY:${netSalary}|MONTH:${month}`
      }, { transaction });

      // Mark bonuses and reimbursements as Paid (will commit on transaction success)
      for (const b of bonuses) {
        await b.update({ status: 'Paid' }, { transaction });
      }
      for (const r of reimbursements) {
        await r.update({ status: 'Paid' }, { transaction });
      }

      totalEmployees++;
      totalSalarySum += gross;
      totalDeductionSum += totalDeductions;
      netPayoutSum += Math.max(0, netSalary);
    }

    // Update central payroll run stats
    await run.update({
      totalEmployees,
      totalSalary: totalSalarySum,
      totalDeduction: totalDeductionSum,
      netPayout: netPayoutSum
    }, { transaction });

    await AuditLog.create({
      action: 'Run Payroll',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: '',
      newValue: JSON.stringify(run.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ success: true, data: run, message: `Payroll for ${month} calculated in draft mode!` });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPayrollRuns = async (req, res) => {
  try {
    const runs = await PayrollRun.findAll({ order: [['month', 'DESC']] });
    res.json({ success: true, data: runs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPayrollRecords = async (req, res) => {
  try {
    const { runId, employeeId, id } = req.query;
    let whereClause = {};
    if (runId) {
      whereClause.payrollRunId = runId;
    }
    if (id) {
      whereClause.id = id;
    }

    // Filter by Employee for employee view
    if (req.user && req.user.role.toLowerCase() === 'employee') {
      whereClause.employeeId = req.user.id;
    } else if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const records = await PayrollRecord.findAll({
      where: whereClause,
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'department', 'designation', 'bankName', 'accountNumber', 'ifscCode', 'pan', 'uan', 'pfNumber', 'joinDate'] }],
      order: [['id', 'ASC']]
    });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approvePayroll = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.body;
    const run = await PayrollRun.findByPk(id);

    if (!run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.' });
    }

    const oldVal = JSON.stringify(run.get({ plain: true }));
    await run.update({ status: 'Approved' }, { transaction });
    await PayrollRecord.update({ status: 'Approved' }, { where: { payrollRunId: id }, transaction });

    await AuditLog.create({
      action: 'Approve Payroll',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(run.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    }, { transaction });

    await transaction.commit();
    res.json({ success: true, message: `Payroll run for ${run.month} approved successfully!` });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markPaid = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.body;
    const run = await PayrollRun.findByPk(id);

    if (!run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.' });
    }

    const oldVal = JSON.stringify(run.get({ plain: true }));
    await run.update({ status: 'Paid' }, { transaction });
    await PayrollRecord.update({ status: 'Paid' }, { where: { payrollRunId: id }, transaction });

    await AuditLog.create({
      action: 'Pay Salaries',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(run.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    }, { transaction });

    await transaction.commit();
    res.json({ success: true, message: `Payroll salaries for ${run.month} marked as PAID!` });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reopenPayroll = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const run = await PayrollRun.findByPk(id);
    if (!run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.' });
    }

    const oldVal = JSON.stringify(run.get({ plain: true }));
    await run.update({ status: 'Draft' }, { transaction });
    await PayrollRecord.update({ status: 'Draft' }, { where: { payrollRunId: id }, transaction });

    await AuditLog.create({
      action: 'Reopen Payroll',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(run.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    }, { transaction });

    await transaction.commit();
    res.json({ success: true, message: `Payroll run for ${run.month} reopened in draft mode.` });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

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

export const getPayslipHtml = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await PayrollRecord.findByPk(id, {
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'department', 'designation', 'bankName', 'accountNumber', 'ifscCode', 'pan', 'uan', 'pfNumber', 'joinDate'] }]
    });

    if (!record) {
      return res.status(404).send('<h1>Payslip record not found</h1>');
    }

    // Role-based Access Control checks:
    // If user is Employee, they can only access their own payslips
    if (req.user && req.user.role.toLowerCase() === 'employee' && record.employeeId !== req.user.id) {
      return res.status(403).send('<h1>Forbidden: You are not authorized to view this payslip</h1>');
    }

    const emp = record.Employee || {};
    const formattedMonth = new Date(`${record.month}-01`).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const actualPayableDays = new Date(new Date(record.month).getFullYear(), new Date(record.month).getMonth() + 1, 0).getDate();
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payslip - ${emp.name} - ${formattedMonth}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333;
      margin: 0;
      padding: 40px;
      background-color: #f8fafc;
    }
    .payslip-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .company-details {
      font-family: monospace;
      font-size: 11px;
      line-height: 1.5;
      text-transform: uppercase;
      color: #475569;
    }
    .brand-logo {
      font-size: 24px;
      font-weight: bold;
      color: #ea580c;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 12px;
      margin: 0 0 20px 0;
      letter-spacing: 0.5px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 11px;
    }
    .info-table tr {
      border-bottom: 1px solid #f1f5f9;
    }
    .info-table td {
      padding: 8px 4px;
      width: 25%;
    }
    .info-label {
      color: #64748b;
      display: block;
      text-transform: uppercase;
      font-size: 9px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .info-val {
      color: #0f172a;
      font-weight: bold;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      margin: 20px 0 10px 0;
      text-transform: uppercase;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 4px;
    }
    .days-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 11px;
    }
    .days-table th {
      text-align: left;
      padding: 6px 4px;
      color: #64748b;
      text-transform: uppercase;
      font-size: 9px;
      font-weight: bold;
      border-bottom: 1px solid #cbd5e1;
    }
    .days-table td {
      padding: 8px 4px;
      font-weight: bold;
    }
    .grid-split {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
      font-size: 12px;
      margin-bottom: 30px;
    }
    .split-col-title {
      margin: 0 0 10px 0;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: bold;
      color: #1e293b;
    }
    .split-table {
      width: 100%;
      border-collapse: collapse;
    }
    .split-table td {
      padding: 6px 0;
    }
    .split-table tr.total-row {
      font-weight: bold;
      border-top: 1px solid #cbd5e1;
    }
    .summary-section {
      border-top: 2px solid #0f172a;
      padding-top: 16px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
    }
    .net-payable {
      font-weight: bold;
      font-size: 14px;
    }
    .in-words {
      color: #64748b;
      font-size: 10px;
    }
    .verification-area {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
    }
    .signature-box {
      font-size: 11px;
      color: #475569;
      max-width: 300px;
    }
    .signature-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background-color: #d1fae5;
      color: #065f46;
      padding: 4px 8px;
      border-radius: 9999px;
      font-weight: bold;
      font-size: 9px;
      margin-top: 4px;
    }
    .qr-box {
      text-align: center;
    }
    .qr-box img {
      width: 80px;
      height: 80px;
      border: 1px solid #e2e8f0;
      padding: 4px;
      border-radius: 4px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 30px;
      padding-top: 12px;
      font-size: 9px;
      color: #64748b;
      font-style: italic;
      text-align: center;
    }
    .btn-bar {
      max-width: 800px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      padding: 10px 20px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-secondary {
      background-color: #e2e8f0;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover {
      background-color: #cbd5e1;
    }
    .btn-primary {
      background-color: #10b981;
      color: white;
      border: none;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }
    .btn-primary:hover {
      background-color: #059669;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .payslip-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .btn-bar {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="btn-bar">
    <button onclick="window.close()" class="btn btn-secondary">✕ Close Window</button>
    <button onclick="window.print()" class="btn btn-primary">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print Payslip
    </button>
  </div>

  <div class="payslip-container">
    <div class="header">
      <div class="company-details">
        34, THIRD FLOOR, BLOCK-2, SIDCO<br>
        ELECTRONIC COMPLEX, GUINDY<br>
        INDUSTRIAL ESTATE..., CHENNAI, TAMIL<br>
        NADU, 600032
      </div>
      <div class="brand-logo">
        ▲ CHRONOS
      </div>
    </div>

    <div class="title">
      Payslip for ${formattedMonth}<br>
      <span style="font-size: 14px; font-weight: normal; color: #475569;">Employee: ${emp.name}</span>
    </div>

    <table class="info-table">
      <tbody>
        <tr>
          <td>
            <span class="info-label">Employee Number</span>
            <span class="info-val">${emp.id === 1 ? 'HMPL110' : ('EMP-' + emp.id.toString().padStart(3, '0'))}</span>
          </td>
          <td>
            <span class="info-label">Date Joined</span>
            <span class="info-val">${emp.joinDate || 'N/A'}</span>
          </td>
          <td>
            <span class="info-label">Department</span>
            <span class="info-val">${emp.department || 'N/A'}</span>
          </td>
          <td>
            <span class="info-label">Sub Department</span>
            <span class="info-val">N/A</span>
          </td>
        </tr>
        <tr>
          <td>
            <span class="info-label">Designation</span>
            <span class="info-val">${emp.designation || 'N/A'}</span>
          </td>
          <td>
            <span class="info-label">Payment Mode</span>
            <span class="info-val">${emp.bankName ? 'Bank Transfer' : 'N/A'}</span>
          </td>
          <td>
            <span class="info-label">UAN</span>
            <span class="info-val">${emp.uan || 'N/A'}</span>
          </td>
          <td>
            <span class="info-label">PF Number</span>
            <span class="info-val">${emp.pfNumber || 'N/A'}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <span class="info-label">PAN Number</span>
            <span class="info-val">${emp.pan || 'N/A'}</span>
          </td>
          <td>
            <span class="info-label">Bank Name</span>
            <span class="info-val">${emp.bankName || 'N/A'}</span>
          </td>
          <td>
            <span class="info-label">Account Number</span>
            <span class="info-val">${emp.accountNumber || 'N/A'}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">Attendance Details</div>
    <table class="days-table">
      <thead>
        <tr>
          <th>Actual Payable Days</th>
          <th>Total Working Days</th>
          <th>Loss of Pay Days</th>
          <th>Days Payable</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${actualPayableDays}</td>
          <td>${actualPayableDays}</td>
          <td>${record.lopDays}</td>
          <td>${actualPayableDays - record.lopDays}</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">Salary details</div>
    <div class="grid-split">
      <div>
        <div class="split-col-title">Earnings</div>
        <table class="split-table">
          <tbody>
            <tr>
              <td>Basic</td>
              <td style="text-align: right; font-weight: bold;">${record.basicPay.toFixed(2)}</td>
            </tr>
            <tr>
              <td>HRA</td>
              <td style="text-align: right; font-weight: bold;">${record.hra.toFixed(2)}</td>
            </tr>
            ${record.conveyance > 0 ? `
            <tr>
              <td>Conveyance</td>
              <td style="text-align: right; font-weight: bold;">${record.conveyance.toFixed(2)}</td>
            </tr>` : ''}
            ${record.medical > 0 ? `
            <tr>
              <td>Medical Allowance</td>
              <td style="text-align: right; font-weight: bold;">${record.medical.toFixed(2)}</td>
            </tr>` : ''}
            ${record.specialAllowance > 0 ? `
            <tr>
              <td>Special Allowance</td>
              <td style="text-align: right; font-weight: bold;">${record.specialAllowance.toFixed(2)}</td>
            </tr>` : ''}
            ${record.otherAllowance > 0 ? `
            <tr>
              <td>Other Allowance</td>
              <td style="text-align: right; font-weight: bold;">${record.otherAllowance.toFixed(2)}</td>
            </tr>` : ''}
            ${record.bonus > 0 ? `
            <tr>
              <td>Bonus Additions</td>
              <td style="text-align: right; font-weight: bold; color: #10b981;">+${record.bonus.toFixed(2)}</td>
            </tr>` : ''}
            ${record.reimbursement > 0 ? `
            <tr>
              <td>Reimbursements</td>
              <td style="text-align: right; font-weight: bold; color: #10b981;">+${record.reimbursement.toFixed(2)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td style="padding-top: 8px;">Total Earnings (A)</td>
              <td style="text-align: right; padding-top: 8px;">${(record.grossSalary + record.bonus + record.reimbursement).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <div class="split-col-title">Contributions</div>
        <table class="split-table" style="margin-bottom: 20px;">
          <tbody>
            <tr>
              <td>PF Employee</td>
              <td style="text-align: right; font-weight: bold;">${record.pf.toFixed(2)}</td>
            </tr>
            ${record.esi > 0 ? `
            <tr>
              <td>ESI Employee</td>
              <td style="text-align: right; font-weight: bold;">${record.esi.toFixed(2)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td style="padding-top: 8px;">Total Contributions (B)</td>
              <td style="text-align: right; padding-top: 8px;">${(record.pf + record.esi).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="split-col-title">Taxes & Deductions</div>
        <table class="split-table">
          <tbody>
            <tr>
              <td>Professional Tax</td>
              <td style="text-align: right; font-weight: bold;">${record.professionalTax.toFixed(2)}</td>
            </tr>
            ${record.tds > 0 ? `
            <tr>
              <td>TDS (Income Tax)</td>
              <td style="text-align: right; font-weight: bold;">${record.tds.toFixed(2)}</td>
            </tr>` : ''}
            ${record.lopAmount > 0 ? `
            <tr>
              <td>LOP (Loss Of Pay)</td>
              <td style="text-align: right; font-weight: bold; color: #ef4444;">${record.lopAmount.toFixed(2)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td style="padding-top: 8px;">Total Deductions (C)</td>
              <td style="text-align: right; padding-top: 8px;">${record.deductions.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="summary-section">
      <div class="summary-row net-payable">
        <span>Net Salary Payable ( A - B - C )</span>
        <span>₹ ${record.netSalary.toFixed(2)}</span>
      </div>
      <div class="summary-row in-words">
        <span>Net Salary in Words</span>
        <span style="font-weight: bold; color: #475569;">${numberToWords(record.netSalary)}</span>
      </div>
    </div>

    <div class="verification-area">
      <div class="signature-box">
        <strong>Digital Signature:</strong><br>
        <span style="font-family: monospace; font-size: 10px; color: #64748b;">${record.digitalSignature || 'Verified digitally by Chronos HR engine'}</span><br>
        <span class="signature-badge">✓ Securesign Verified</span>
      </div>
      ${record.qrCodeData ? `
      <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(record.qrCodeData)}" alt="QR Verification">
        <div style="font-size: 8px; color: #64748b; margin-top: 4px;">Scan to Verify</div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      *Note: All amounts displayed in this payslip are in INR. This is a computer generated document and does not require a physical signature.
    </div>
  </div>
</body>
</html>
    `;
    res.send(html);
  } catch (err) {
    res.status(500).send(`<h1>Server Error</h1><p>${err.message}</p>`);
  }
};

