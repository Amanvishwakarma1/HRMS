import { Announcement } from '../models/Announcement.js';
import { Employee } from '../models/Employee.js';
import { Op } from 'sequelize';

// 1. Get announcements (filtered for user audience)
export const getAnnouncements = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.user.id);
    const department = employee ? employee.department : '';
    const role = req.user.role;
    const empIdStr = String(req.user.id);

    // Fetch announcements that match target criteria and have not expired
    const list = await Announcement.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { targetAudience: 'All' },
              {
                [Op.and]: [
                  { targetAudience: 'Department' },
                  { targetId: department }
                ]
              },
              {
                [Op.and]: [
                  { targetAudience: 'Role' },
                  { targetId: role }
                ]
              },
              {
                [Op.and]: [
                  { targetAudience: 'Individual' },
                  { targetId: empIdStr }
                ]
              }
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
      message: 'Announcements retrieved successfully.',
      data: list
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get all announcements (Admin view of announcements, includes expired ones)
export const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const list = await Announcement.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({
      success: true,
      message: 'All announcements retrieved successfully.',
      data: list
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, targetAudience, targetId, expiryDate } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and Message are required.' });
    }

    const item = await Announcement.create({
      title,
      message,
      priority: priority || 'Low',
      targetAudience: targetAudience || 'All',
      targetId: targetId || null,
      expiryDate: expiryDate || null,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: item
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, priority, targetAudience, targetId, expiryDate } = req.body;

    const item = await Announcement.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    await item.update({
      title: title || item.title,
      message: message || item.message,
      priority: priority || item.priority,
      targetAudience: targetAudience || item.targetAudience,
      targetId: targetId !== undefined ? targetId : item.targetId,
      expiryDate: expiryDate !== undefined ? expiryDate : item.expiryDate,
      updatedBy: req.user.id
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: item
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete announcement (Soft delete)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Announcement.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    await item.destroy();
    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
