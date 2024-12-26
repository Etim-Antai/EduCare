// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const notificationController = require('../controllers/notificationController');

// Grades CRUD operations
router.post('/grades', gradeController.addGrade); // Endpoint to add a grade
router.put('/grades/:id', gradeController.updateGrade); // Endpoint to update a grade
router.delete('/grades/:id', gradeController.deleteGrade); // Endpoint to delete a grade
router.get('/grades', gradeController.getGrades); // Endpoint to get all grades

// Route to send a notification for an assignment
router.post('/assignments/notifications', notificationController.sendNotificationForAssignment);

// Route to get notifications for a specific student
router.get('/students/:student_id/notifications', notificationController.getNotifications);

// Route to get all notifications
router.get('/', notificationController.getAllNotifications); 

module.exports = router;
