import { JobOpening } from '../models/JobOpening.js';
import { Applicant } from '../models/Applicant.js';
import { Employee } from '../models/Employee.js';
import { Op } from 'sequelize';

// Standardized response helper
const sendResponse = (res, statusCode, success, message, data = {}) => {
  return res.status(statusCode).json({ success, message, data });
};

// 1. Get all openings
export const getAllOpenings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', status = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause = {};

    if (search) {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }
    if (department) {
      whereClause.department = department;
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await JobOpening.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    });

    // For each opening, calculate applicants count
    const list = [];
    for (const job of rows) {
      const applicantsCount = await Applicant.count({ where: { jobOpeningId: job.id } });
      list.push({
        ...job.get({ plain: true }),
        applicantsCount
      });
    }

    return sendResponse(res, 200, true, 'Job openings retrieved successfully.', {
      total: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      jobs: list
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 2. Create opening
export const createOpening = async (req, res) => {
  try {
    const { title, department, vacancyCount, description } = req.body;
    if (!title || !department) {
      return sendResponse(res, 400, false, 'Title and Department are required.');
    }

    const job = await JobOpening.create({
      title,
      department,
      vacancyCount: vacancyCount ? Number(vacancyCount) : 1,
      description,
      status: 'Active',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    return sendResponse(res, 201, true, 'Job opening created successfully.', job);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 3. Update opening
export const updateOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, vacancyCount, description, status } = req.body;

    const job = await JobOpening.findByPk(id);
    if (!job) {
      return sendResponse(res, 404, false, 'Job opening not found.');
    }

    await job.update({
      title: title || job.title,
      department: department || job.department,
      vacancyCount: vacancyCount !== undefined ? Number(vacancyCount) : job.vacancyCount,
      description: description || job.description,
      status: status || job.status,
      updatedBy: req.user.id
    });

    return sendResponse(res, 200, true, 'Job opening updated successfully.', job);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 4. Delete opening (Soft delete)
export const deleteOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobOpening.findByPk(id);
    if (!job) {
      return sendResponse(res, 404, false, 'Job opening not found.');
    }

    await job.destroy(); // paranoid soft delete
    return sendResponse(res, 200, true, 'Job opening deleted successfully.');
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 5. Close opening
export const closeOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobOpening.findByPk(id);
    if (!job) {
      return sendResponse(res, 404, false, 'Job opening not found.');
    }

    await job.update({ status: 'Closed', updatedBy: req.user.id });
    return sendResponse(res, 200, true, 'Job opening closed successfully.', job);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 6. Get applicants
export const getApplicants = async (req, res) => {
  try {
    const { jobOpeningId } = req.params;
    const list = await Applicant.findAll({
      where: { jobOpeningId: Number(jobOpeningId) },
      order: [['createdAt', 'DESC']]
    });
    return sendResponse(res, 200, true, 'Applicants retrieved successfully.', list);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 7. Create applicant
export const createApplicant = async (req, res) => {
  try {
    const { jobOpeningId } = req.params;
    const { name, email, phone, resumeUrl } = req.body;
    if (!name || !email) {
      return sendResponse(res, 400, false, 'Name and Email are required.');
    }

    const job = await JobOpening.findByPk(jobOpeningId);
    if (!job) {
      return sendResponse(res, 404, false, 'Job opening not found.');
    }

    const applicant = await Applicant.create({
      jobOpeningId: Number(jobOpeningId),
      name,
      email,
      phone,
      resumeUrl,
      status: 'Applied'
    });

    return sendResponse(res, 201, true, 'Application submitted successfully.', applicant);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 8. Update applicant status
export const updateApplicantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return sendResponse(res, 400, false, 'Status is required.');
    }

    const applicant = await Applicant.findByPk(id);
    if (!applicant) {
      return sendResponse(res, 404, false, 'Applicant not found.');
    }

    await applicant.update({ status });
    return sendResponse(res, 200, true, 'Applicant status updated successfully.', applicant);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
