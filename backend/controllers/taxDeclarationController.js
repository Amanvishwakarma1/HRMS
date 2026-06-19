import { TaxDeclaration } from '../models/TaxDeclaration.js';
import { Employee } from '../models/Employee.js';
import { AuditLog } from '../models/AuditLog.js';
import { SalaryStructure } from '../models/SalaryStructure.js';

export const createTaxDeclaration = async (req, res) => {
  try {
    const { financialYear, category, amount, proofUrl } = req.body;
    const employeeId = req.user.id;

    if (!financialYear || !category || !amount) {
      return res.status(400).json({ success: false, message: 'Financial year, category, and amount are required.' });
    }

    const dec = await TaxDeclaration.create({
      employeeId, financialYear, category, amount, proofUrl, status: 'Pending'
    });

    await AuditLog.create({
      action: 'Submit Tax Declaration',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: '',
      newValue: JSON.stringify(dec.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: dec, message: 'Tax declaration submitted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTaxDeclarations = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user && req.user.role.toLowerCase() === 'employee') {
      whereClause.employeeId = req.user.id;
    }

    const list = await TaxDeclaration.findAll({
      where: whereClause,
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'department', 'designation'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveTaxDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Choose Approved or Rejected.' });
    }

    const dec = await TaxDeclaration.findByPk(id);
    if (!dec) {
      return res.status(404).json({ success: false, message: 'Tax declaration record not found.' });
    }

    const oldVal = JSON.stringify(dec.get({ plain: true }));
    await dec.update({ status });

    await AuditLog.create({
      action: `${status} Tax Declaration`,
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(dec.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, data: dec, message: `Declaration has been ${status.toLowerCase()}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getYearlyTaxReport = async (req, res) => {
  try {
    const { employeeId, financialYear } = req.query;

    if (!employeeId || !financialYear) {
      return res.status(400).json({ success: false, message: 'Employee ID and financial year are required.' });
    }

    const declarations = await TaxDeclaration.findAll({
      where: { employeeId, financialYear, status: 'Approved' }
    });

    const structure = await SalaryStructure.findOne({ where: { employeeId } });
    const annualBasic = structure ? (structure.basicPay * 12) : 0;
    const annualGross = structure ? ((structure.basicPay + structure.hra + structure.specialAllowance + structure.otherAllowance) * 12) : 0;

    // Calculate sum of declarations by category
    const categoriesSum = {
      '80C': 0,
      '80D': 0,
      'HRA': 0,
      'NPS': 0,
      'Home Loan': 0,
      'Education Loan': 0
    };

    declarations.forEach(d => {
      if (categoriesSum[d.category] !== undefined) {
        categoriesSum[d.category] += d.amount;
      }
    });

    // 80C limit: 1,50,000, 80D limit: 25,000, NPS limit: 50,000
    const allowable80C = Math.min(categoriesSum['80C'], 150000);
    const allowable80D = Math.min(categoriesSum['80D'], 25000);
    const allowableNPS = Math.min(categoriesSum['NPS'], 50000);
    const allowableHomeLoan = categoriesSum['Home Loan'];
    const allowableEducationLoan = categoriesSum['Education Loan'];
    const allowableHRA = categoriesSum['HRA'];

    const totalDeductions = allowable80C + allowable80D + allowableNPS + allowableHomeLoan + allowableEducationLoan + allowableHRA;
    const netTaxableIncome = Math.max(0, annualGross - totalDeductions);

    // Calculate tax slab:
    // up to 3L: Nil
    // 3L to 6L: 5%
    // 6L to 9L: 10%
    // 9L to 12L: 15%
    // 12L to 15L: 20%
    // above 15L: 30%
    let tax = 0;
    let tempIncome = netTaxableIncome;

    if (tempIncome > 1500000) {
      tax += (tempIncome - 1500000) * 0.3;
      tempIncome = 1500000;
    }
    if (tempIncome > 1200000) {
      tax += (tempIncome - 1200000) * 0.2;
      tempIncome = 1200000;
    }
    if (tempIncome > 900000) {
      tax += (tempIncome - 900000) * 0.15;
      tempIncome = 900000;
    }
    if (tempIncome > 600000) {
      tax += (tempIncome - 600000) * 0.10;
      tempIncome = 600000;
    }
    if (tempIncome > 300000) {
      tax += (tempIncome - 300000) * 0.05;
    }

    res.json({
      success: true,
      data: {
        financialYear,
        annualGross,
        declarationsSum: categoriesSum,
        allowableDeductions: {
          '80C': allowable80C,
          '80D': allowable80D,
          'NPS': allowableNPS,
          'Home Loan': allowableHomeLoan,
          'Education Loan': allowableEducationLoan,
          'HRA': allowableHRA
        },
        totalAllowableDeductions: totalDeductions,
        netTaxableIncome,
        estimatedAnnualTax: tax,
        estimatedMonthlyTDS: parseFloat((tax / 12).toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTaxDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    const dec = await TaxDeclaration.findByPk(id);
    if (!dec) {
      return res.status(404).json({ success: false, message: 'Declaration not found.' });
    }
    const oldVal = JSON.stringify(dec.get({ plain: true }));
    await dec.destroy();

    await AuditLog.create({
      action: 'Delete Tax Declaration',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: '',
      ipAddress: req.ip || '127.0.0.1'
    });
    res.json({ success: true, message: 'Tax declaration deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
