import fs from 'fs';
import { readData, writeData } from './db.js';

const sendNotification = (userId, type, title, message) => {
  try {
    console.log("Reading data...");
    const db = readData();
    console.log("Read completed. notifications type:", typeof db.notifications, "isArray:", Array.isArray(db.notifications));
    db.notifications.unshift({
      id: String(Date.now()) + Math.random().toString(36).substring(2, 5),
      userId: userId ? Number(userId) : null,
      type: type || 'info',
      title,
      message,
      time: 'Just now',
      isRead: false
    });
    console.log("Writing data...");
    writeData(db);
    console.log("Write completed successfully!");
  } catch (err) {
    console.error('Failed to trigger notification:', err.message);
  }
};

sendNotification(4, 'warning', 'Test Title', 'Test Message');
