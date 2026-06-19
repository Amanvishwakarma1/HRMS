import { sequelize } from '../config/db.js';
import { Employee } from '../models/Employee.js';
import { JobOpening } from '../models/JobOpening.js';
import { Applicant } from '../models/Applicant.js';
import { Onboarding } from '../models/Onboarding.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Expense } from '../models/Expense.js';
import { Announcement } from '../models/Announcement.js';
import { Op } from 'sequelize';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    const userId = req.user.id;

    // ==========================================
    // 1. HEADCOUNT METRICS
    // ==========================================
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { status: 'Active' } });
    const inactiveEmployees = await Employee.count({ where: { status: 'Inactive' } });
    const probationEmployees = await Employee.count({ where: { employmentType: 'Probation' } });
    const permanentEmployees = await Employee.count({ where: { employmentType: 'Permanent' } });

    // Distributions
    const departmentWise = await Employee.findAll({
      attributes: [
        [sequelize.fn('COALESCE', sequelize.col('department'), 'Unassigned'), 'department'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('COALESCE', sequelize.col('department'), 'Unassigned')],
      raw: true
    });

    const genderWise = await Employee.findAll({
      attributes: [
        [sequelize.fn('COALESCE', sequelize.col('gender'), 'Male'), 'gender'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('COALESCE', sequelize.col('gender'), 'Male')],
      raw: true
    });

    const employmentTypeWise = await Employee.findAll({
      attributes: [
        [sequelize.fn('COALESCE', sequelize.col('employment_type'), 'Permanent'), 'employmentType'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('COALESCE', sequelize.col('employment_type'), 'Permanent')],
      raw: true
    });

    // ==========================================
    // 2. OPEN POSITIONS METRICS
    // ==========================================
    const activeOpenings = await JobOpening.findAll({
      where: { status: 'Active' },
      order: [['createdAt', 'DESC']]
    });

    const jobsList = [];
    let totalOpeningsCount = 0;
    for (const job of activeOpenings) {
      const applicantsCount = await Applicant.count({ where: { jobOpeningId: job.id } });
      totalOpeningsCount += job.vacancyCount;
      jobsList.push({
        id: job.id,
        title: job.title,
        department: job.department,
        vacancyCount: job.vacancyCount,
        applicantsCount,
        createdAt: job.createdAt
      });
    }

    // ==========================================
    // 3. ONBOARDING METRICS
    // ==========================================
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    startOfMonth.setHours(0, 0, 0, 0);

    const joinersToday = await Employee.count({
      where: { joinDate: { [Op.gte]: startOfToday } }
    });

    const joinersWeek = await Employee.count({
      where: { joinDate: { [Op.gte]: startOfWeek } }
    });

    const joinersMonth = await Employee.count({
      where: { joinDate: { [Op.gte]: startOfMonth } }
    });

    // Onboarding checklist workflow progress
    const onboardingStatusCounts = await Onboarding.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // ==========================================
    // 4. LEAVE & APPROVALS STATS
    // ==========================================
    // Leave Counts
    const pendingLeaves = await LeaveRequest.count({ where: { status: 'Pending' } });
    const approvedLeaves = await LeaveRequest.count({ where: { status: 'Approved' } });
    const rejectedLeaves = await LeaveRequest.count({ where: { status: 'Rejected' } });
    const cancelledLeaves = await LeaveRequest.count({ where: { status: 'Cancelled' } });

    // Recent Leave Requests List (Top 5)
    const recentLeaves = await LeaveRequest.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: Employee, as: 'employee', attributes: ['name', 'email', 'department'] }]
    });

    // Approvals Statistics
    let pendingApprovalsCount = 0;
    let completedApprovalsCount = 0;

    // Leave approvals: if admin/hr/manager
    if (role === 'admin' || role === 'hr') {
      pendingApprovalsCount += await LeaveRequest.count({ where: { status: 'Pending' } });
      completedApprovalsCount += await LeaveRequest.count({ where: { status: ['Approved', 'Rejected'] } });

      // Expense approvals
      pendingApprovalsCount += await Expense.count({ where: { status: ['Submitted', 'Resubmitted'] } });
      completedApprovalsCount += await Expense.count({ where: { status: ['HR Approved', 'Finance Approved', 'Rejected'] } });
    } else if (role === 'finance') {
      // Finance reviews HR Approved claims
      pendingApprovalsCount += await Expense.count({ where: { status: 'HR Approved' } });
      completedApprovalsCount += await Expense.count({ where: { status: ['Finance Approved', 'Rejected'] } });
    } else if (role === 'manager') {
      // Manager reviews their reporting employee's leaves
      const teamEmployees = await Employee.findAll({ where: { managerId: userId } });
      const teamIds = teamEmployees.map(e => e.id);
      
      pendingApprovalsCount += await LeaveRequest.count({ where: { employeeId: teamIds, status: 'Pending' } });
      completedApprovalsCount += await LeaveRequest.count({ where: { employeeId: teamIds, status: ['Approved', 'Rejected'] } });

      pendingApprovalsCount += await Expense.count({ where: { employeeId: teamIds, status: ['Submitted', 'Resubmitted'] } });
    }

    // ==========================================
    // 5. ANNOUNCEMENTS
    // ==========================================
    const empRecord = await Employee.findByPk(userId);
    const department = empRecord ? empRecord.department : '';
    const userRole = empRecord ? empRecord.role : '';

    const latestAnnouncements = await Announcement.findAll({
      limit: 5,
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { targetAudience: 'All' },
              { [Op.and]: [{ targetAudience: 'Department' }, { targetId: department }] },
              { [Op.and]: [{ targetAudience: 'Role' }, { targetId: userRole }] },
              { [Op.and]: [{ targetAudience: 'Individual' }, { targetId: String(userId) }] }
            ]
          },
          {
            [Op.or]: [
              { expiryDate: null },
              { expiryDate: { [Op.gte]: new Date() } }
            ]
          }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Dashboard analytics aggregated successfully.',
      data: {
        headcount: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          probation: probationEmployees,
          permanent: permanentEmployees,
          departmentWise,
          genderWise,
          employmentTypeWise
        },
        recruitment: {
          totalOpenPositions: totalOpeningsCount,
          activeJobs: jobsList
        },
        onboarding: {
          joinersToday,
          joinersWeek,
          joinersMonth,
          statusCounts: onboardingStatusCounts
        },
        leaves: {
          statistics: {
            pending: pendingLeaves,
            approved: approvedLeaves,
            rejected: rejectedLeaves,
            cancelled: cancelledLeaves
          },
          recent: recentLeaves
        },
        approvals: {
          pendingCount: pendingApprovalsCount,
          completedCount: completedApprovalsCount
        },
        announcements: {
          latest: latestAnnouncements,
          unreadCount: latestAnnouncements.length
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
