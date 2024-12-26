const TeacherNotification = require('../models/teacherNotificationModel'); // Ensure this path is correct

// Create notification
exports.createNotification = async (req, res) => {
    const { teacher_id, message, event_type } = req.body;

    // Validate required fields
    if (!teacher_id || !message || !event_type) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newNotificationId = await TeacherNotification.create({
            teacher_id,
            message,
            event_type,
            read_status: 0 // Default to unread
        });
        res.status(201).json({ message: 'Notification created successfully!', notification_id: newNotificationId });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'An error occurred while creating the notification.' });
    }
};

// Notify teacher when a class is created
exports.notifyTeacherOnClassCreation = async (teacherId, className) => {
    const message = `A new class "${className}" has been created.`;
    const event_type = 'Class Creation';
    try {
        await TeacherNotification.create({
            teacher_id: teacherId,
            message,
            event_type,
            read_status: 0
        });
    } catch (error) {
        console.error('Error notifying teacher about class creation:', error);
    }
};

// Notify teacher when a timetable is created
exports.notifyTeacherOnTimetableCreation = async (teacherId, timetableName) => {
    const message = `A new timetable "${timetableName}" has been created.`;
    const event_type = 'Timetable Creation';
    try {
        await TeacherNotification.create({
            teacher_id: teacherId,
            message,
            event_type,
            read_status: 0
        });
    } catch (error) {
        console.error('Error notifying teacher about timetable creation:', error);
    }
};

// Notify students on submission
exports.notifyStudentsOnSubmission = async (studentIds, assignmentTitle) => {
    for (const studentId of studentIds) {
        const message = `Your submission for "${assignmentTitle}" has been received.`;
        const event_type = 'Submission Received';
        try {
            await TeacherNotification.create({
                teacher_id: studentId, // Assuming teacher_id is not supposed to be used here
                message,
                event_type,
                read_status: 0
            });
        } catch (error) {
            console.error('Error notifying student about submission:', error);
        }
    }
};

// Fetch notifications based on teacher ID
exports.getNotifications = async (req, res) => {
    const teacherId = req.user.id; // Assuming teacher ID is stored in the request user after authentication

    try {
        const notifications = await TeacherNotification.getNotificationsByTeacher(teacherId);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'An error occurred while fetching notifications.' });
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    const notificationId = req.params.id;

    try {
        await TeacherNotification.markAsRead(notificationId);
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'An error occurred while marking the notification as read.' });
    }
};

// Fetch all notifications (if you intend to have a route for this)
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await TeacherNotification.getAllNotifications();
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({ error: 'An error occurred while fetching all notifications.' });
    }
};
