// models/notificationModel.js
const db = require('../config/db'); // Database connection setup

class NotificationModel {
    // Create a new notification
    async createNotification(notificationData) {
        const { student_id, title, message, material_id, assignment_id } = notificationData; // Include assignment_id if needed

        try {
            const [result] = await db.query(
                `INSERT INTO notifications (student_id, title, message, material_id, assignment_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [student_id, title, message, material_id, assignment_id]
            );
            return result.insertId; // Return the ID of the newly created notification
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error; // Re-throw the error for handling in the controller
        }
    }

    // Fetch notifications for a student
    async getNotificationsForStudent(studentId) {
        try {
            const [rows] = await db.query('SELECT * FROM notifications WHERE student_id = ?', [studentId]);
            return rows; // Return rows fetched for the student
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error; // Re-throw the error for handling in the controller
        }
    }
}

module.exports = new NotificationModel(); // Export a single instance of the NotificationModel class
