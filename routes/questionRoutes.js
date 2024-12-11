const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const QuestionController = require('../controllers/questionController');

// Middleware to protect routes
router.use(authMiddleware.protect()); // Ensure user is authenticated

// Route for creating a new question
router.post('/', authMiddleware.isTeacher, QuestionController.createQuestion);

// Route for getting all questions related to a specific assignment
router.get('/assignment/:assignment_id', QuestionController.getQuestionsByAssignment);

// Route for getting a specific question by ID
router.get('/:id', QuestionController.getQuestionById);

module.exports = router;
