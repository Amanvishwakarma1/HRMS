import { Reimbursement } from '../models/Reimbursement.js';
import { Employee } from '../models/Employee.js';
import { AuditLog } from '../models/AuditLog.js';

export const createReimbursement = async (req, res) => {
  try {
    const { amount, category, month, description, billUrl } = req.body;
    const employeeId = req.user.id;

    if (!amount || !category || !month) {
      return res.status(400).json({ success: false, message: 'Amount, category, and month are required.' });
    }

    const reimbursement = await Reimbursement.create({
      employeeId, amount, category, month, description, billUrl, status: 'Submitted'
    });

    await AuditLog.create({
      action: 'Submit Reimbursement',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: '',
      newValue: JSON.stringify(reimbursement.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: reimbursement, message: 'Reimbursement claim submitted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReimbursements = async (req, res) => {
  try {
    let whereClause = {};
    // If logged-in user is an employee, only show their claims
    if (req.user && req.user.role.toLowerCase() === 'employee') {
      whereClause.employeeId = req.user.id;
    }

    const list = await Reimbursement.findAll({
      where: whereClause,
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'department', 'designation'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved, Rejected, or Paid

    if (!['Approved', 'Rejected', 'Paid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid reimbursement status override.' });
    }

    const claim = await Reimbursement.findByPk(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Reimbursement claim not found.' });
    }

    const oldVal = JSON.stringify(claim.get({ plain: true }));
    await claim.update({ status });

    await AuditLog.create({
      action: `${status} Reimbursement`,
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: JSON.stringify(claim.get({ plain: true })),
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, data: claim, message: `Claim has been marked as ${status.toLowerCase()}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Reimbursement.findByPk(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Reimbursement not found.' });
    }
    const oldVal = JSON.stringify(claim.get({ plain: true }));
    await claim.destroy();

    await AuditLog.create({
      action: 'Delete Reimbursement',
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      oldValue: oldVal,
      newValue: '',
      ipAddress: req.ip || '127.0.0.1'
    });
    res.json({ success: true, message: 'Reimbursement claim removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
