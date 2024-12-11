// const notificationModel = require('../models/notificationModel');

// // Add a new notification for a student
// exports.addNotification = async (req, res) => {
//     const { student_id, message, material_id, title, assignment_id } = req.body; // Include assignment_id if needed

//     // Validate input
//     if (!student_id || !message || !title) {
//         return res.status(400).json({ message: 'Missing required fields: student_id, message, and title' });
//     }

//     try {
//         const notificationId = await notificationModel.addNotification({
//             student_id,
//             message,
//             material_id,
//             title,
//             assignment_id // Include assignment_id if relevant
//         });
//         res.status(201).json({ message: 'Notification added successfully', notificationId });
//     } catch (error) {
//         console.error('Error adding notification:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Delete a notification
// exports.deleteNotification = async (req, res) => {
//     const notificationId = req.params.id;

//     if (!notificationId) {
//         return res.status(400).json({ message: 'Notification ID is required' });
//     }

//     try {
//         await notificationModel.deleteNotification(notificationId);
//         res.status(200).json({ message: 'Notification deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting notification:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Get all notifications for a specific student
// exports.getNotifications = async (req, res) => {
//     const studentId = req.params.student_id; // Capture student ID from request parameters

//     // Validate input
//     if (!studentId) {
//         return res.status(400).json({ message: 'Student ID is required' });
//     }

//     try {
//         const notifications = await notificationModel.getNotifications(studentId);
//         res.status(200).json({ data: notifications });
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// controllers/notificationController.js
const Notification = require('../models/notificationModel');

// Send a notification for an assignment
exports.sendNotificationForAssignment = async (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
};

// Get notifications for a specific student
exports.getNotifications = async (req, res) => {
    const studentId = req.params.student_id; // Get student ID from request parameters
    try {
        const notifications = await Notification.getNotificationsForStudent(studentId);
        res.status(200).json({ data: notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
