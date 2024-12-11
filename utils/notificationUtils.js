const AdminNotification = require('../models/adminNotificationModel'); // Ensure this path is correct

/**
 * Creates a general notification.
 * @param {String} message - The notification message.
 * @param {String} type - The type of notification.
 * @param {Integer} teacherId - The ID of the teacher, if applicable.
 * @param {Integer} studentId - The ID of the student, if applicable.
 * @param {Integer} classMaterialId - The ID of the associated class material, if applicable.
 * @param {Integer} attendanceId - The ID of the attendance record, if applicable.
 */
const createNotification = async (message, type, teacherId = null, studentId = null, classMaterialId = null, attendanceId = null) => {
    try {
        await AdminNotification.create({
            message,
            type,
            teacher_id: teacherId,
            student_id: studentId,
            class_material_id: classMaterialId,
            attendance_id: attendanceId,
            is_read: 0, // Default to unread
        });
        console.log('Notification created:', { message, type }); // Log the created notification
    } catch (error) {
        console.error('Error creating notification:', error); // Logs any error that occurs
    }
};

// Function to create a teacher login notification
const createTeacherLoginNotification = async (teacherId) => {
    const message = `Teacher with ID ${teacherId} has logged in.`;
    const type = 'teacher_login';
    await createNotification(message, type, teacherId);
};

// Function to create a class material posted notification
const createClassMaterialPostedNotification = async (teacherId, classMaterialId) => {
    const message = `Teacher with ID ${teacherId} posted new class materials.`;
    const type = 'class_material_posted';
    await createNotification(message, type, teacherId, null, classMaterialId);
};

// Function to create an attendance marked notification
const createAttendanceMarkedNotification = async (teacherId, attendanceId) => {
    const message = `Attendance has been marked by Teacher with ID ${teacherId}.`;
    const type = 'attendance_marked';
    await createNotification(message, type, teacherId, null, null, attendanceId);
};

// Function to create a student login notification
const createStudentLoginNotification = async (studentId) => {
    const message = `Student with ID ${studentId} has logged in.`;
    const type = 'student_login';
    await createNotification(message, type, null, studentId);
};

// Function to create a student registration notification
const createStudentRegistrationNotification = async (studentId) => {
    const message = `New student with ID ${studentId} has been registered.`;
    const type = 'student_registration';
    await createNotification(message, type, null, studentId);
};

// Function to create an assignment submission notification
const createAssignmentSubmissionNotification = async (studentId, assignmentId) => {
    const message = `Student with ID ${studentId} has submitted an assignment with ID ${assignmentId}.`;
    const type = 'assignment_submission';
    await createNotification(message, type, null, studentId, null);
};

// Function to create an admin retrieval notification
const createAdminRetrievalNotification = async (adminId) => {
    const message = `Admin with ID ${adminId} was retrieved.`;
    const type = 'admin_retrieval';
    await createNotification(message, type);
};

// Export utility functions
module.exports = {
    createTeacherLoginNotification,
    createClassMaterialPostedNotification,
    createAttendanceMarkedNotification,
    createStudentLoginNotification,
    createStudentRegistrationNotification,
    createAssignmentSubmissionNotification, // Exporting the new function
    createAdminRetrievalNotification
};
