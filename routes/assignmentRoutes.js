// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware'); // Adjust path as necessary

// Protect the routes based on user roles
router.post('/', authMiddleware.protect(['Teacher']), assignmentController.create); // Only Teachers can create a new assignment
// url: http://localhost:9000/api/assignments

router.get('/', authMiddleware.protect(['Teacher', 'Student']), assignmentController.getAll); // Teachers and Students can get all assignments
router.get('/:id', authMiddleware.protect(['Teacher', 'Student']), assignmentController.getById); // Teachers and Students can get specific assignment details
router.put('/:id', authMiddleware.protect(['Teacher']), assignmentController.update); // Only Teachers can update an assignment
router.delete('/:id', authMiddleware.protect(['Teacher']), assignmentController.delete); // Only Teachers can delete an assignment



module.exports = router;
