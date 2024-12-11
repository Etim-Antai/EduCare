// models/adminNotificationModel.js
const db = require('../config/db'); // Adjust the path based on your project structure

const AdminNotification = {
    create: async (notification) => {
        const { message, type, teacher_id, student_id, class_material_id, attendance_id } = notification;
        const query = `
            INSERT INTO admin_notifications (message, type, teacher_id, student_id, class_material_id, attendance_id)
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(query, [message, type, teacher_id, student_id, class_material_id, attendance_id]);
        return result.insertId; // Return the ID of the newly created notification
    },

    getAll: async () => {
        const query = `SELECT * FROM admin_notifications ORDER BY created_at DESC`;
        const [results] = await db.query(query);
        return results; // Return all notifications
    },

    markAsRead: async (notificationId) => {
        const query = `UPDATE admin_notifications SET is_read = 1 WHERE notification_id = ?`;
        await db.query(query, [notificationId]);
    }
};

module.exports = AdminNotification;
