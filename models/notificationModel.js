// models/notificationModel.js
const db = require('../config/db'); // Database connection setup

class NotificationModel {
    // Create a new notification
    async createNotification(notificationData) {
        const { student_id, title, message, material_id, assignment_id } = notificationData;

        try {
            const [result] = await db.query(
                `INSERT INTO notifications (student_id, title, message, material_id, assignment_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [student_id, title, message, material_id, assignment_id]
            );
            return result.insertId; 
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error; 
        }
    }

    // Fetch notifications for a student
    async getNotificationsForStudent(studentId) {
        console.log('Fetching notifications for student ID:', studentId); // Debug log
        try {
            const [rows] = await db.query('SELECT * FROM notifications WHERE student_id = ?', [studentId]);
            console.log('Fetched rows:', rows); // Log fetched rows
            return rows; 
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error; 
        }
    }

    // Fetch all notifications
    async getAllNotifications() {
        try {
            const [rows] = await db.query('SELECT * FROM notifications');
            console.log('Fetched all notifications:', rows); // Log all fetched notifications
            return rows; 
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error; 
        }
    }
}

module.exports = new NotificationModel();
