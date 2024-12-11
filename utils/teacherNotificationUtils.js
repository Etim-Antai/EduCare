const db = require('../config/db'); // Database connection setup

class TeacherNotificationUtils {
    /**
     * Create a new notification for a teacher
     * @param {Object} notificationData - The data for the notification
     * @param {number} notificationData.teacher_id - The ID of the teacher
     * @param {string} notificationData.message - The notification message
     * @param {string} notificationData.event_type - The type of event (e.g., "Student Login", "Submission", "Timetable Update")
     */
    static async createNotification({ teacher_id, message, event_type }) {
        try {
            const [result] = await db.query(
                'INSERT INTO teacher_notifications (teacher_id, message, event_type) VALUES (?, ?, ?)',
                [teacher_id, message, event_type]
            );
            return result.insertId; // Return the ID of the created notification
        } catch (error) {
            console.error('Error creating teacher notification:', error.message);
            throw new Error('Could not create teacher notification');
        }
    }

    /**
     * Fetch all notifications for a teacher
     * @param {number} teacher_id - The ID of the teacher
     * @param {boolean} unreadOnly - If true, fetch only unread notifications
     */
    static async fetchNotifications(teacher_id, unreadOnly = false) {
        try {
            let query = 'SELECT * FROM teacher_notifications WHERE teacher_id = ?';
            const params = [teacher_id];

            if (unreadOnly) {
                query += ' AND read_status = 0';
            }

            query += ' ORDER BY created_at DESC';

            const [notifications] = await db.query(query, params);
            return notifications;
        } catch (error) {
            console.error('Error fetching teacher notifications:', error.message);
            throw new Error('Could not fetch teacher notifications');
        }
    }

    /**
     * Mark a notification as read
     * @param {number} notification_id - The ID of the notification to mark as read
     */
    static async markAsRead(notification_id) {
        try {
            await db.query(
                'UPDATE teacher_notifications SET read_status = 1 WHERE notification_id = ?',
                [notification_id]
            );
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error.message);
            throw new Error('Could not mark notification as read');
        }
    }

    /**
     * Delete a notification
     * @param {number} notification_id - The ID of the notification to delete
     */
    static async deleteNotification(notification_id) {
        try {
            await db.query('DELETE FROM teacher_notifications WHERE notification_id = ?', [notification_id]);
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error.message);
            throw new Error('Could not delete notification');
        }
    }

    /**
     * Create a notification for a student login
     * @param {number} teacher_id - The ID of the teacher to notify
     * @param {string} studentName - The name of the student who logged in
     */
    static async notifyStudentLogin(teacher_id, studentName) {
        const message = `Student ${studentName} has logged in to the system.`;
        await this.createNotification({
            teacher_id,
            message,
            event_type: 'Student Login',
        });
    }

    /**
     * Create a notification for a student submission
     * @param {number} teacher_id - The ID of the teacher to notify
     * @param {string} assignmentTitle - The title of the submitted assignment
     * @param {string} studentName - The name of the student who submitted
     */
    static async notifyStudentSubmission(teacher_id, assignmentTitle, studentName) {
        const message = `Student ${studentName} submitted assignment: ${assignmentTitle}.`;
        await this.createNotification({
            teacher_id,
            message,
            event_type: 'Student Submission',
        });
    }

    /**
     * Create a notification for timetable update
     * @param {number} teacher_id - The ID of the teacher to notify
     * @param {string} adminName - The name of the admin who updated the timetable
     */
    static async notifyTimetableUpdate(teacher_id, adminName) {
        const message = `Admin ${adminName} has updated the timetable. Please check the schedule.`;
        await this.createNotification({
            teacher_id,
            message,
            event_type: 'Timetable Update',
        });
    }
}

module.exports = TeacherNotificationUtils;
