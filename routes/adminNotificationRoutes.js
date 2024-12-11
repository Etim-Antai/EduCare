// adminNotificationRoutes.js
const express = require('express');
const router = express.Router();
const AdminNotificationController = require('../controllers/adminNotificationController');

// Define routes
router.post('/', AdminNotificationController.createNotification); // Create a new notification
router.get('/', AdminNotificationController.getAllNotifications); // Get all notifications
router.put('/:notificationId/read', AdminNotificationController.markNotificationAsRead); // Mark notification as read

module.exports = router;
