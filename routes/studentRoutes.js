const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Only Admin can add, update, or delete a student
router.post('/', protect(['Super Admin', 'Data Manager']), studentController.addStudent);
router.put('/:id', protect(['Super Admin', 'Data Manager']), studentController.updateStudent);
router.delete('/:id', protect(['Super Admin', 'Data Manager']), studentController.deleteStudent);

// Authenticated users can fetch all students
router.get('/', protect(), studentController.getStudents);

// Students can view their notifications (Authenticated)
router.get('/notifications', protect(['Student']), studentController.getNotifications);

// Students can mark notifications as read
router.patch('/notifications/:notificationId/read', protect(['Student']), studentController.markNotificationAsRead);

// Students can view class materials (Authenticated)
router.get('/materials', protect(['Student']), studentController.getClassMaterials);

// Students can view their attendance overview (Authenticated)
router.get('/attendance-overview', protect(['Student']), studentController.getAttendanceOverview);

// Students can view their assignment grades (Authenticated)
router.get('/assignment-grades', protect(['Student']), studentController.getAssignmentGrades);

// Students can view the total number of classes (Authenticated)
router.get('/total-classes', protect(['Student']), studentController.getTotalClasses);

// Students can view notifications count (Authenticated)
router.get('/notifications/count', protect(['Student']), studentController.getNotificationsCount);

// Students can view class participation over time (Authenticated)
router.get('/class-participation', protect(['Student']), studentController.getClassParticipation);

// Get a summary of statistics for the dashboard (Authenticated)
router.get('/statistics', protect(['Student']), studentController.getStatistics);

// Get students by class ID (Authenticated for teachers)
router.get('/classes/:classId', protect(['Teacher']), studentController.getStudentsByClassId);

// Example URL: http://localhost:9000/api/students/classes/5

// getClassParticipation
router.get('/class-participation', protect(['Student']), studentController.getClassParticipation)

// viewProfile

router.get('/profile/:studentId', protect(['Student']), studentController.viewProfile)


module.exports = router;
