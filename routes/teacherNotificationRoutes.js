const express = require('express');
const router = express.Router();
const teacherNotificationController = require('../controllers/teacherNotificationController');
const { protect } = require('../middleware/authMiddleware'); // Import your authentication middleware

// Route to create a new notification (only for Admins)
router.post('/', protect(['Super Admin', 'Data Manager']), teacherNotificationController.createNotification);

// Route to get notifications for the authenticated teacher
router.get('/', protect(['Teacher']), teacherNotificationController.getNotifications);

// Route to mark a notification as read (only for Teachers)
router.patch('/:id/read', protect(['Teacher']), teacherNotificationController.markNotificationAsRead);

// Optional: Route to get all notifications (for Admins or Teachers)
router.get('/all', protect(['Super Admin', 'Data Manager', 'Teacher']), teacherNotificationController.getAllNotifications);

module.exports = router;
