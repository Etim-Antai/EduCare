const db = require('../config/db');  // Adjust the path to your actual DB config

class TeacherNotification {
    // Create a new notification
    static async create(notificationData) {
        try {
            const result = await db.query(
                'INSERT INTO teacher_notifications (teacher_id, message, event_type, read_status) VALUES (?, ?, ?, ?)',
                [
                    notificationData.teacher_id, 
                    notificationData.message, 
                    notificationData.event_type,
                    notificationData.read_status || 0 // Default to unread if not specified
                ]
            );
            return result.insertId; // Return the ID of the new notification
        } catch (error) {
            console.error('Error creating notification:', error);
            throw new Error('An error occurred while creating the notification.');
        }
    }

    // Get notifications for a specific teacher
    static async getNotificationsByTeacher(teacherId) {
        try {
            const [notifications] = await db.query(
                'SELECT * FROM teacher_notifications WHERE teacher_id = ? ORDER BY created_at DESC',
                [teacherId]
            );
            return notifications; // Return the list of notifications
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error('An error occurred while fetching notifications.');
        }
    }

    // Get all notifications (if needed)
    static async getAllNotifications() {
        try {
            const [notifications] = await db.query(
                'SELECT * FROM teacher_notifications ORDER BY created_at DESC'
            );
            return notifications; // Return the list of all notifications
        } catch (error) {
            console.error('Error fetching all notifications:', error);
            throw new Error('An error occurred while fetching all notifications.');
        }
    }

    // Mark a notification as read
    static async markAsRead(notificationId) {
        try {
            await db.query(
                'UPDATE teacher_notifications SET read_status = 1 WHERE notification_id = ?',
                [notificationId]
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error('An error occurred while marking the notification as read.');
        }
    }

    // Optional: Get counts of read/unread notifications for a teacher
    static async getNotificationCounts(teacherId) {
        try {
            const [results] = await db.query(`
                SELECT 
                    SUM(CASE WHEN read_status = 1 THEN 1 ELSE 0 END) AS readCount,
                    SUM(CASE WHEN read_status = 0 THEN 1 ELSE 0 END) AS unreadCount
                FROM teacher_notifications
                WHERE teacher_id = ?;
            `, [teacherId]);
            return results[0]; // Return the counts
        } catch (error) {
            console.error('Error fetching notification counts:', error);
            throw new Error('An error occurred while fetching notification counts.');
        }
    }
}

module.exports = TeacherNotification;
