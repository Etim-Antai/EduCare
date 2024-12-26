// controllers/notificationController.js
const Notification = require('../models/notificationModel');

// Send a notification for an assignment
exports.sendNotificationForAssignment = async (req, res) => {
    console.log('Send Notification Request Body:', req.body);
    
    try {
        const { student_id, message, assignment_id, title } = req.body; // Expect these fields from the request
        
        if (!student_id || !message || !title) {
            return res.status(400).json({ message: 'Missing required fields: student_id, message, title' });
        }

        const newNotificationId = await Notification.createNotification({
            student_id,
            title,
            message,
            assignment_id, // Include assignment_id for linking if applicable
            material_id: null // Optional if not applicable
        });

        res.status(201).json({ id: newNotificationId, message: 'Notification sent successfully for the assignment!' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get notifications for a specific student
exports.getNotifications = async (req, res) => {
    const studentId = req.params.student_id; // Get student ID from request parameters
    console.log('Get Notifications Request for Student ID:', studentId);
    
    try {
        const notifications = await Notification.getNotificationsForStudent(studentId);
        res.status(200).json({ data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all notifications
exports.getAllNotifications = async (req, res) => {
    console.log('Get All Notifications Request');
    
    try {
        const notifications = await Notification.getAllNotifications();
        res.status(200).json({ data: notifications });
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({ error: error.message });
    }    
};          
