const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const timetableController = require('../controllers/timetableController');
// Middleware: Protect all admin routes, allowing both Admins and Super Admins
router.use(protect(['Admin', 'Super Admin'])); // Protect these routes with 'Admin' and 'Super Admin' roles

// Admin Routes
router.get('/stats', adminController.stats); // Admin dashboard

// Admin Management Routes
router.post('/add-admin', adminController.addAdmin); // Add a new admin
router.put('/update-profile', adminController.updateAdmin); // Update admin details
router.delete('/delete-admin/:id', adminController.deleteAdmin); // Delete an admin
router.get('/profile', adminController.getAdminProfile); // Get admin profile without ID (uses token instead)
router.get('/admins', adminController.getAdmins); // View all admins

// Teacher Management Routes
router.route('/teachers')
    .get(adminController.getTeachers) // View all teachers
    .post(adminController.addTeacher); // Add a new teacher

router.route('/teachers/:id')
    .put(adminController.updateTeacher) // Update teacher details
    .delete(adminController.deleteTeacher); // Delete a teacher

// Class Management Routes
router.post('/classes', adminController.addClass); // Add a new class
router.put('/update-class/:id', adminController.updateClass); // Update class details
router.delete('/delete-class/:id', adminController.deleteClass); // Delete a class
router.get('/classes', adminController.getClasses); // View all classes

// Viewing class materials
router.get('/materials', adminController.getClassMaterials); // View class materials

// View students
router.get('/students', adminController.getAllStudents); // View all students

// Chart-related Routes
router.get('/teacher-distribution', adminController.getTeacherDistribution); // Get teacher distribution by subject
router.get('/student-enrollment', adminController.getStudentEnrollmentOverTime); // Get student enrollment over time
router.get('/assignments-per-class', adminController.getAssignmentSubmissionsPerClass); // Get assignment submissions per class
router.get('/attendance-overview', adminController.getAttendanceOverview); // Get attendance overview
router.get('/notifications-summary', adminController.getNotificationsSummary); // Get notifications summary

// Timetable Management
router.get('/timetable', timetableController.getTimetable); // View timetable
router.post('/timetable', timetableController.addTimetableEntry); // Add a timetable entry


router.get('/grades-distribution', adminController.getGradesDistribution);
router.get('/attendance-trends', adminController.getAttendanceTrends);
router.get('/assignment-submission-rates', adminController. getAssignmentSubmissionRates);





module.exports = router;
