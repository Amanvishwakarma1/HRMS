import { Bonus } from '../models/Bonus.js';
import { Employee } from '../models/Employee.js';
import { AuditLog } from '../models/AuditLog.js';

export const createBonus = async (req, res) => {
  try {
    const { employeeId, amount, type, month, description } = req.body;

    if (!employeeId || !amount || !type || !month) {
      return res.status(400).json({ success: false, message: 'Missing required inputs.' });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const bonus = await Bonus.create({
      employeeId, amount, type, month, description, status: 'Pending Approval'
    });

    await AuditLog.create({
      action: 'Assign Bonus',
      userId: req.user?.id || 1,
      username: req.user?.username || 'admin',
      role: req.user?.role || 'admin',
      oldValue: '',
      newValue: JSON.stringify(bonus.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: bonus, message: 'Bonus assigned and pending approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkAssignBonus = async (req, res) => {
  try {
    const { employeeIds, amount, type, month, description } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || !amount || !type || !month) {
      return res.status(400).json({ success: false, message: 'Missing bulk assign fields.' });
    }

    const bonuses = [];
    for (const empId of employeeIds) {
      const b = await Bonus.create({
        employeeId: empId, amount, type, month, description, status: 'Pending Approval'
      });
      bonuses.push(b);
    }

    await AuditLog.create({
      action: 'Bulk Assign Bonus',
      userId: req.user?.id || 1,
      username: req.user?.username || 'admin',
      role: req.user?.role || 'admin',
      oldValue: '',
      newValue: `Created ${bonuses.length} bonus records for month ${month}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, count: bonuses.length, message: `Successfully bulk-assigned bonuses to ${bonuses.length} employees!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBonuses = async (req, res) => {
  try {
    const list = await Bonus.findAll({
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'department', 'designation'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveBonus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Choose Approved or Rejected.' });
    }

    const bonus = await Bonus.findByPk(id);
    if (!bonus) {
      return res.status(404).json({ success: false, message: 'Bonus not found.' });
    }

    const oldVal = JSON.stringify(bonus.get({ plain: true }));
    await bonus.update({ status });

    await AuditLog.create({
      action: `${status} Bonus`,
      userId: req.user?.id || 1,
      username: req.user?.username || 'admin',
      role: req.user?.role || 'admin',
      oldValue: oldVal,
      newValue: JSON.stringify(bonus.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, data: bonus, message: `Bonus request has been ${status.toLowerCase()}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBonus = async (req, res) => {
  try {
    const { id } = req.params;
    const bonus = await Bonus.findByPk(id);
    if (!bonus) {
      return res.status(404).json({ success: false, message: 'Bonus not found.' });
    }
    const oldVal = JSON.stringify(bonus.get({ plain: true }));
    await bonus.destroy();

    await AuditLog.create({
      action: 'Delete Assigned Bonus',
      userId: req.user?.id || 1,
      username: req.user?.username || 'admin',
      role: req.user?.role || 'admin',
      oldValue: oldVal,
      newValue: '',
      ipAddress: req.ip || '127.0.0.1'
    });
    res.json({ success: true, message: 'Bonus assigned record removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
