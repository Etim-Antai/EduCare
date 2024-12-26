const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware'); // Adjust path as necessary
const classMaterialController = require('../controllers/classMaterialController');

// Add a new teacher (Admin only)
router.post('/teachers', authMiddleware.protect(['Admin']), teacherController.addTeacher);

// Update teacher details (Admin & Data Manager)
router.put('/teachers/:id', authMiddleware.protect(['Admin', 'Data Manager']), teacherController.updateTeacher);

// Delete a teacher (Admin only)
router.delete('/teachers/:id', authMiddleware.protect(['Admin']), teacherController.deleteTeacher);

// Get all teachers (public access)
router.get('/teachers', teacherController.getAllTeachers);  // ok

// Get teacher details by ID (public access)
router.get('/teachers/:id', teacherController.getTeacherById); // ok

// Fetch all students associated with teachers (Teacher only)
router.get('/students', authMiddleware.protect(['Teacher']), teacherController.getAllStudents); // ok

// Add class material (Teacher only)
router.post('/materials', authMiddleware.protect(['Teacher']), teacherController.addClassMaterial); 
router.post('/materials/upload', authMiddleware.protect(['Teacher']), classMaterialController.create);

// Fetch class materials uploaded by the teacher (Teacher only)
router.get('/materials', authMiddleware.protect(['Teacher']), teacherController.getClassMaterialsByTeacher); // ok

// Fetch class materials by class ID (public access)
router.get('/materials/class/:classId', teacherController.getClassMaterialsByClassId); // ok

// Get teacher profile (Teacher only)
router.get('/profile', authMiddleware.protect(['Teacher']), teacherController.getTeacherProfile); // ok

// **New Routes for Dashboard Data**
// Fetch teacher statistics for the dashboard (Teacher only)
router.get('/dashboard/stats', authMiddleware.protect(['Teacher']), teacherController.getTeacherDashboardStats);

// Fetch average grades by class (Teacher only)
router.get('/dashboard/average-grades', authMiddleware.protect(['Teacher']), teacherController.getAvgGradesByClass);

// Fetch attendance statistics (Teacher only)
router.get('/dashboard/attendance', authMiddleware.protect(['Teacher']), teacherController.getAttendanceStats);

// Fetch assignment submission rates (Teacher only)
router.get('/dashboard/submission-rates', authMiddleware.protect(['Teacher']), teacherController.getAssignmentSubmissionRates);

// Fetch total students by class (Teacher only)
router.get('/dashboard/total-students', authMiddleware.protect(['Teacher']), teacherController.getTotalStudentsByClass);

// Fetch assignments completion statistics (Teacher only)
router.get('/dashboard/assignments-completion', authMiddleware.protect(['Teacher']), teacherController.getAssignmentsCompletionStats);

// Fetch overall attendance statistics (Teacher only)
router.get('/dashboard/overall-attendance', authMiddleware.protect(['Teacher']), teacherController.getOverallAttendanceStats);

// Fetch recent submission rates (Teacher only)
router.get('/dashboard/recent-submission-rates', authMiddleware.protect(['Teacher']), teacherController.getRecentSubmissionRates);

module.exports = router;
