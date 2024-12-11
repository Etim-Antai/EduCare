const express = require('express');
const router = express.Router();
const teacherNotificationController = require('../controllers/teacherNotificationController');
const { protect } = require('../middleware/authMiddleware'); // Import your auth middleware

// Route to create a new notification
router.post('/', protect, teacherNotificationController.createNotification);

// Route to get notifications for the authenticated teacher
router.get('/', protect, teacherNotificationController.getNotifications);

// Route to mark a notification as read
router.patch('/:id/read', protect, teacherNotificationController.markNotificationAsRead);

// Optional: Route to get all notifications (for admin or for teacher overview, if needed)
router.get('/all', protect, teacherNotificationController.getAllNotifications);

module.exports = router;
