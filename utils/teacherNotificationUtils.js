// utils/teacherNotificationUtils.js
const TeacherNotification = require('../models/teacherNotificationModel'); // Ensure this path is correct

/**
 * Creates a general notification for teachers.
 * @param {String} message - The notification message.
 * @param {String} event_type - The type of event (e.g., "Student Login").
 * @param {number} teacher_id - The ID of the teacher to notify.
 */
const createNotification = async (message, event_type, teacher_id) => {
    try {
        const notificationId = await TeacherNotification.create({
            teacher_id,
            message,
            event_type,
            read_status: 0, // Default to unread
        });
        console.log(`Notification created for teacher ${teacher_id}: ${message}`);
        return notificationId; // Return the ID of the created notification
    } catch (error) {
        console.error('Error creating notification:', error);
        throw new Error('Failed to create notification.');
    }
};

// Function to create a notification for a student login
const notifyStudentLogin = async (teacher_id, student_id, studentName) => {
    const message = `Student ${studentName} (ID: ${student_id}) has logged in to the system.`;
    await createNotification(message, 'Student Login', teacher_id);
};

// Function to create a notification for a student submission
const notifyStudentSubmission = async (teacher_id, assignmentTitle, studentName) => {
    const message = `Student ${studentName} submitted assignment: ${assignmentTitle}.`;
    await createNotification(message, 'Student Submission', teacher_id);
};

// Function to create a notification for class creation
const notifyClassCreation = async (teacher_id, className) => {
    const message = `A new class "${className}" has been created.`;
    await createNotification(message, 'Class Creation', teacher_id);
};

// Function to create a notification for timetable updates
const notifyTimetableUpdate = async (teacher_id, adminName) => {
    const message = `Admin ${adminName} has updated the timetable. Please check the schedule.`;
    await createNotification(message, 'Timetable Update', teacher_id);
};

// Export utility functions
module.exports = {
    createNotification, // Added for direct access if needed
    notifyStudentLogin,
    notifyStudentSubmission,
    notifyClassCreation,
    notifyTimetableUpdate,
};
