const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');   
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Importing middleware

// Admin Authentication Routes
router.post('/admin/login', authController.loginAdmin);  // Logs in an admin

// Admin Management Routes
router.post('/admin/register', protect(), isAdmin, authController.registerAdmin); // Register an admin
router.post('/admin/reset-password', protect(), isAdmin, authController.resetPassword); // Resets an admin's password
router.get('/admin/admins', protect(), isAdmin, authController.getAllAdmins); // Retrieve all admins

// Fetch Profile for Logged-in Admin
router.get('/admin/profile', protect(), authController.getAdminById); // Fetch the profile of the logged-in admin

// Teacher Management Routes
router.route('/admin/teachers')
    .post(protect(), isAdmin, authController.registerTeacher)   // Registers a new teacher
    .get(authController.getAllTeachers);                         // Retrieves all teachers

router.route('/admin/teachers/:teacher_id')
    .get(authController.getTeacherById)                          // Retrieves a specific teacher by ID
    .put(protect(), isAdmin, authController.updateTeacherById)  // Updates a specific teacher by ID
    .delete(protect(), isAdmin, authController.deleteTeacherById); // Deletes a specific teacher by ID

// Student Management Routes
router.route('/admin/students')
    .post(protect(), isAdmin, authController.registerStudent) // Registers a new student
    .get(authController.getAllStudents);                        // Retrieves all students

router.route('/admin/students/:student_id')
    .get(authController.getStudentById)                         // Retrieves a specific student by ID
    .put(protect(), isAdmin, authController.updateStudentById) // Updates a specific student by ID
    .delete(protect(), isAdmin, authController.deleteStudentById); // Deletes a specific student by ID

// Teacher and Student Login Routes
router.post('/teacher/login', authController.loginTeacher); // Login as teacher
router.post('/student/login', authController.loginStudent); // Login as student//
// getAllClasses

router.get('/classes', authController.getAllClasses); // Retrieves all classes

module.exports = router;

// Server Port: 9000
