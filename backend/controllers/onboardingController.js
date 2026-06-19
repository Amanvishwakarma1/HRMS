import { Onboarding } from '../models/Onboarding.js';
import { Employee } from '../models/Employee.js';
import { Op } from 'sequelize';

// 1. Get onboarding list (Today, Week, Month joiners)
export const getOnboardingList = async (req, res) => {
  try {
    const { period = 'month', status = '' } = req.query;
    
    const today = new Date();
    let startDate;
    
    if (period === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate = new Date();
      startDate.setDate(today.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // default: month
      startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }
    
    const employees = await Employee.findAll({
      where: {
        joinDate: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: Onboarding,
        as: 'onboarding'
      }],
      order: [['joinDate', 'DESC']]
    });
    
    // Auto-initialize onboarding workflow for joiners who don't have one
    const list = [];
    for (const emp of employees) {
      if (!emp.onboarding) {
        // Create a default onboarding entry
        const ob = await Onboarding.create({
          employeeId: emp.id,
          status: 'Document Pending'
        });
        const reloadedEmp = await Employee.findByPk(emp.id, {
          include: [{ model: Onboarding, as: 'onboarding' }]
        });
        list.push(reloadedEmp);
      } else {
        list.push(emp);
      }
    }
    
    // If status filter is active
    let filtered = list;
    if (status) {
      filtered = list.filter(emp => emp.onboarding?.status === status);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Onboarding list retrieved successfully.',
      data: filtered
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Initiate onboarding manually
export const createOnboarding = async (req, res) => {
  try {
    const { employeeId, onboardingPeriodDays } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required.' });
    }
    
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    
    const existing = await Onboarding.findOne({ where: { employeeId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Onboarding workflow already exists.' });
    }
    
    const onboarding = await Onboarding.create({
      employeeId,
      status: 'Document Pending',
      onboardingPeriodDays: onboardingPeriodDays || 30
    });
    
    return res.status(201).json({ success: true, message: 'Onboarding initiated.', data: onboarding });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update onboarding workflow status
export const updateOnboardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    
    const onboarding = await Onboarding.findByPk(id);
    if (!onboarding) {
      return res.status(404).json({ success: false, message: 'Onboarding record not found.' });
    }
    
    const updates = { status };
    if (status === 'Verification Pending') {
      updates.verifiedAt = new Date();
    } else if (status === 'Completed') {
      updates.trainingCompletedAt = new Date();
    }
    
    await onboarding.update(updates);
    
    return res.status(200).json({ success: true, message: 'Onboarding status updated.', data: onboarding });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
