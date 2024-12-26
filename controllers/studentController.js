const studentModel = require('../models/studentModel');
const Joi = require('joi'); // Validation library
const db = require('../config/db');

// Validation schema for adding/updating students
const studentSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(), // Including 'Other' option
    date_of_birth: Joi.date().required(),
    address: Joi.string().required(),
    contact_info: Joi.string().pattern(/^[0-9]{11}$/).required(), // Assuming it's a phone number format
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    enrollment_date: Joi.date().required(),
    class_id: Joi.number().integer().required()
});

// Add a New Student
exports.addStudent = async (req, res) => {
    const { error } = studentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const studentId = await studentModel.addStudent(req.body);
        res.status(201).json({ message: 'Student added successfully', studentId });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Student Details
exports.updateStudent = async (req, res) => {
    const studentId = req.params.id;

    const { error } = studentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const student = await studentModel.getStudentById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await studentModel.updateStudent(studentId, req.body);
        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};






// view student profile
exports.viewProfile = async (req, res) => {
    const studentId = req.params.id;

    try {
        const student = await studentModel.getStudentById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ data: student });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
    };


















// Delete a Student (Soft Delete)
exports.deleteStudent = async (req, res) => {
    const studentId = req.params.id;

    try {
        const student = await studentModel.getStudentById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await studentModel.deleteStudent(studentId); // Assuming this performs a soft delete
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Students
exports.getStudents = async (req, res) => {
    const { search = '', class_id = null } = req.query; // Optional filters

    try {
        const students = await studentModel.getStudents(search, class_id);
        res.status(200).json({ data: students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch class materials for a student
exports.getClassMaterials = async (req, res) => {
    const studentId = req.user.id; // Use the student ID from the JWT token

    try {
        const [materials] = await db.query(
            `SELECT cm.* 
             FROM classmaterials cm 
             JOIN classes c ON cm.class_id = c.class_id 
             WHERE c.class_id = (SELECT class_id FROM students WHERE student_id = ?) 
             AND cm.deleted_at IS NULL`,
            [studentId]
        );

        if (materials.length === 0) {
            return res.status(404).json({ message: 'No class materials found' });
        }

        res.status(200).json({ data: materials });
    } catch (error) {
        console.error('Error fetching class materials:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get students by class ID
exports.getStudentsByClassId = async (req, res) => {
    const classId = req.params.classId; // Make sure the route matches this parameter

    try {
        const students = await studentModel.getStudents('', classId);
        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found' });
        }
        res.status(200).json({ data: students });
    } catch (error) {
        console.error('Error fetching students by class ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Notifications for the logged-in student
exports.getNotifications = async (req, res) => {
    const studentId = req.user.id; // Assuming the student ID is in the JWT token

    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE student_id = ? ORDER BY notification_date DESC', 
            [studentId]
        );

        if (notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found' });
        }

        res.status(200).json({ data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Attendance Overview for the logged-in student
exports.getAttendanceOverview = async (req, res) => {
    const studentId = req.user.id; // Use the student ID from the JWT token

    try {
        const [attendanceOverview] = await db.query(
            `SELECT 
                COUNT(CASE WHEN status = 'Present' THEN 1 END) AS attended,
                COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS missed
            FROM attendance
            WHERE student_id = ?`,
            [studentId]
        );

        res.status(200).json({ data: attendanceOverview });
    } catch (error) {
        console.error('Error fetching attendance overview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Assignment Grades for the logged-in student
exports.getAssignmentGrades = async (req, res) => {
    const studentId = req.user.id; // Use the student ID from the JWT token

    try {
        const [grades] = await db.query(
            `SELECT 
                a.title AS assignment_title, 
                g.score AS score
            FROM grades g
            JOIN assignments a ON g.assignment_id = a.assignment_id -- Ensure the 'assignment_id' exists in 'grades'
            WHERE g.student_id = ?`,
            [studentId]
        );

        if (grades.length === 0) {
            return res.status(404).json({ message: 'No grades found for this student' });
        }

        res.status(200).json({ data: grades });
    } catch (error) {
        console.error('Error fetching assignment grades:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get total classes for the logged-in student
exports.getTotalClasses = async (req, res) => {
    const studentId = req.user.id; // Use the student ID from the JWT token

    try {
        const [totalClasses] = await db.query(
            `SELECT 
                COUNT(DISTINCT classes.class_id) AS total_classes
            FROM classes 
            JOIN students ON students.class_id = classes.class_id 
            WHERE students.student_id = ?`,
            [studentId]
        );

        res.status(200).json({ data: totalClasses });
    } catch (error) {
        console.error('Error fetching total classes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get notifications count for the logged-in student
exports.getNotificationsCount = async (req, res) => {
    const studentId = req.user.id; // Use the student ID from the JWT token

    try {
        const [notificationsCount] = await db.query(
            `SELECT 
                COUNT(CASE WHEN is_read = 0 THEN 1 END) AS unread_notifications,
                COUNT(CASE WHEN is_read = 1 THEN 1 END) AS read_notifications
            FROM notifications
            WHERE student_id = ?`,
            [studentId]
        );

        res.status(200).json({ data: notificationsCount });
    } catch (error) {
        console.error('Error fetching notifications count:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get class participation over time for the logged-in student
exports.getClassParticipation = async (req, res) => {
    const studentId = req.user.id; // Use the student ID from the JWT token

    try {
        const [participation] = await db.query(
            `SELECT 
                DATE(date) AS attendance_date, 
                COUNT(CASE WHEN status = 'Present' THEN 1 END) AS present_count
            FROM attendance
            WHERE student_id = ?
            GROUP BY DATE(date)`,
            [studentId]
        );

        res.status(200).json({ data: participation });
    } catch (error) {
        console.error('Error fetching class participation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        await db.query(`UPDATE notifications SET is_read = 1 WHERE notification_id = ?`, [notificationId]);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Statistics for Dashboard
exports.getStatistics = async (req, res) => {
    const studentId = req.user.id; // Get student ID from JWT token

    try {
        const [statistics] = await db.query(
            `SELECT
                COUNT(DISTINCT classes.class_id) AS total_classes,
                COUNT(CASE WHEN attendance.status = 'Present' THEN 1 END) AS attended,
                COUNT(CASE WHEN attendance.status = 'Absent' THEN 1 END) AS missed,
                (SELECT COUNT(DISTINCT assignment_id) 
                 FROM assignments 
                 WHERE class_id IN (
                     SELECT class_id 
                     FROM classes 
                     WHERE teacher_id = ?)
                ) AS total_assignments,
                AVG(grades.score) AS average_score
            FROM attendance
            LEFT JOIN classes ON attendance.class_id = classes.class_id
            LEFT JOIN grades ON grades.student_id = ?
            WHERE attendance.student_id = ?`,
            [studentId, studentId, studentId]
        );

        res.status(200).json({ data: statistics });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};








    // Get Class Participation Data
exports.getClassParticipation = async (req, res) => {
    const studentId = req.user.id; // Get student ID from JWT token

    try {
        const participationData = await db.query(
            `SELECT 
                DATE(date) AS attendance_date, 
                COUNT(CASE WHEN status = 'Present' THEN 1 END) AS present_count 
            FROM attendance 
            WHERE student_id = ? 
            GROUP BY DATE(date)`,
            [studentId]
        );

        // Return the fetched participation data
        res.status(200).json({ data: participationData });
    } catch (error) {
        console.error('Error fetching class participation:', error);
        res.status(500).json({ message: 'Failed to fetch class participation' });
    }
    };