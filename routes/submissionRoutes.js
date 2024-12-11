const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/authMiddleware');

// Route for submitting assignments
router.post('/submit', authMiddleware.protect(), submissionController.submit);

// Route to automatically grade a submission
router.put('/grade/:id', authMiddleware.protect(), authMiddleware.isTeacher, submissionController.automateGradeSubmission);
router.get('/submissions', submissionController.getAllSubmissions);



module.exports = router;


