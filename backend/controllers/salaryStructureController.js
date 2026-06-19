import { SalaryStructure, SalaryStructureHistory } from '../models/SalaryStructure.js';
import { Employee } from '../models/Employee.js';
import { AuditLog } from '../models/AuditLog.js';

export const createSalaryStructure = async (req, res) => {
  try {
    const { employeeId, basicPay, hra, conveyance, medical, specialAllowance, otherAllowance, pf, esi, professionalTax, changeReason } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required.' });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Check if structure already exists
    let structure = await SalaryStructure.findOne({ where: { employeeId } });
    let isNew = false;
    let oldVal = '';

    if (!structure) {
      isNew = true;
      structure = await SalaryStructure.create({
        employeeId, basicPay, hra, conveyance, medical, specialAllowance, otherAllowance, pf, esi, professionalTax
      });
    } else {
      oldVal = JSON.stringify(structure.get({ plain: true }));
      await structure.update({
        basicPay, hra, conveyance, medical, specialAllowance, otherAllowance, pf, esi, professionalTax
      });
    }

    // Save revision history
    await SalaryStructureHistory.create({
      employeeId, basicPay, hra, conveyance, medical, specialAllowance, otherAllowance, pf, esi, professionalTax,
      changeReason: changeReason || (isNew ? 'Initial Setup' : 'Salary Revision')
    });

    // Log audit
    await AuditLog.create({
      action: isNew ? 'Create Salary Structure' : 'Update Salary Structure',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(structure.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: structure, message: 'Salary structure saved successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSalaryStructures = async (req, res) => {
  try {
    const list = await SalaryStructure.findAll({
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'department', 'designation'] }]
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const structure = await SalaryStructure.findOne({
      where: { employeeId: id },
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'department', 'designation'] }]
    });
    
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found for this employee.' });
    }
    
    res.json({ success: true, data: structure });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const structure = await SalaryStructure.findByPk(id);

    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found.' });
    }

    const oldVal = JSON.stringify(structure.get({ plain: true }));
    const { basicPay, hra, conveyance, medical, specialAllowance, otherAllowance, pf, esi, professionalTax, changeReason } = req.body;

    await structure.update({
      basicPay, hra, conveyance, medical, specialAllowance, otherAllowance, pf, esi, professionalTax
    });

    // Save history
    await SalaryStructureHistory.create({
      employeeId: structure.employeeId, basicPay, hra, conveyance, medical, specialAllowance, otherAllowance, pf, esi, professionalTax,
      changeReason: changeReason || 'Revision update'
    });

    // Log audit
    await AuditLog.create({
      action: 'Update Salary Structure',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(structure.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, data: structure, message: 'Salary structure updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const structure = await SalaryStructure.findByPk(id);

    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found.' });
    }

    const oldVal = JSON.stringify(structure.get({ plain: true }));
    await structure.destroy();

    // Log audit
    await AuditLog.create({
      action: 'Delete Salary Structure',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: '',
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Salary structure deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cloneSalaryStructure = async (req, res) => {
  try {
    const { sourceEmployeeId, targetEmployeeId } = req.body;

    if (!sourceEmployeeId || !targetEmployeeId) {
      return res.status(400).json({ success: false, message: 'Source and target employee IDs are required.' });
    }

    const source = await SalaryStructure.findOne({ where: { employeeId: sourceEmployeeId } });
    if (!source) {
      return res.status(404).json({ success: false, message: 'Source salary structure not found.' });
    }

    const targetEmployee = await Employee.findByPk(targetEmployeeId);
    if (!targetEmployee) {
      return res.status(404).json({ success: false, message: 'Target employee not found.' });
    }

    let target = await SalaryStructure.findOne({ where: { employeeId: targetEmployeeId } });
    let oldVal = '';
    
    if (target) {
      oldVal = JSON.stringify(target.get({ plain: true }));
      await target.update({
        basicPay: source.basicPay,
        hra: source.hra,
        conveyance: source.conveyance,
        medical: source.medical,
        specialAllowance: source.specialAllowance,
        otherAllowance: source.otherAllowance,
        pf: source.pf,
        esi: source.esi,
        professionalTax: source.professionalTax
      });
    } else {
      target = await SalaryStructure.create({
        employeeId: targetEmployeeId,
        basicPay: source.basicPay,
        hra: source.hra,
        conveyance: source.conveyance,
        medical: source.medical,
        specialAllowance: source.specialAllowance,
        otherAllowance: source.otherAllowance,
        pf: source.pf,
        esi: source.esi,
        professionalTax: source.professionalTax
      });
    }

    // Save history
    await SalaryStructureHistory.create({
      employeeId: targetEmployeeId,
      basicPay: source.basicPay,
      hra: source.hra,
      conveyance: source.conveyance,
      medical: source.medical,
      specialAllowance: source.specialAllowance,
      otherAllowance: source.otherAllowance,
      pf: source.pf,
      esi: source.esi,
      professionalTax: source.professionalTax,
      changeReason: `Cloned from Employee #${sourceEmployeeId}`
    });

    // Log audit
    await AuditLog.create({
      action: 'Clone Salary Structure',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(target.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, data: target, message: 'Salary structure cloned successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRevisionHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const history = await SalaryStructureHistory.findAll({
      where: { employeeId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
