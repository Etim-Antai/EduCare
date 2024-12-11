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
router.get('/teachers', teacherController.getAllTeachers);

// Get teacher details by ID (public access)
router.get('/teachers/:id', teacherController.getTeacherById);

// Fetch all students associated with teachers (Teacher only)
router.get('/students', authMiddleware.protect(['Teacher']), teacherController.getAllStudents);

// Add class material (Teacher only)
router.post('/materials', authMiddleware.protect(['Teacher']), teacherController.addClassMaterial);
router.post('/materials/upload', authMiddleware.protect(['Teacher']), classMaterialController.create);
// Fetch class materials uploaded by the teacher (Teacher only)
router.get('/materials', authMiddleware.protect(['Teacher']), teacherController.getClassMaterialsByTeacher);

// Fetch class materials by class ID (public access)
router.get('/materials/class/:classId', teacherController.getClassMaterialsByClassId);

// Get teacher profile (Teacher only)
router.get('/profile', authMiddleware.protect(['Teacher']), teacherController.getTeacherProfile);




module.exports = router;
