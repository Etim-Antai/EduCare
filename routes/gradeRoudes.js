const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

// Grades CRUD operations
router.post('/', gradeController.addGrade);
router.put('/:id', gradeController.updateGrade);
router.delete('/:id', gradeController.deleteGrade);
router.get('/', gradeController.getGrades);

module.exports = router;
