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
        // Fetch class materials based on student ID
        const [materials] = await db.query(
            'SELECT cm.* FROM classmaterials cm JOIN classes c ON cm.class_id = c.class_id WHERE c.class_id = (SELECT class_id FROM students WHERE student_id = ?) AND cm.deleted_at IS NULL',
            [studentId]
        );

        if (materials.length === 0) {
            return res.status(404).json({ message: 'No class materials found' });
        }

        res.status(200).json({ data: materials });
    } catch (error) {
        console.error('Error fetching class materials:', error);
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Notifications for the logged-in student
exports.getNotifications = async (req, res) => {
    const studentId = req.user.id; // Assuming the student ID is in the JWT token

    try {
        // Query the database to get notifications for the student
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
        res.status(500).json({ message: 'Server error' });
    }
};
