const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, isStudent } = require('../middleware/authMiddleware');

// Only Admin can add, update, or delete a student
router.post('/', protect(['Super Admin', 'Data Manager']), studentController.addStudent);
router.put('/:id', protect(['Super Admin', 'Data Manager']), studentController.updateStudent);
router.delete('/:id', protect(['Super Admin', 'Data Manager']), studentController.deleteStudent);

// Authenticated users can fetch all students
router.get('/', protect(), studentController.getStudents);

// Students can view their notifications (Authenticated and checked for student role)
router.get('/notifications', protect(['Student']), studentController.getNotifications);

// Students can view class materials (Authenticated and checked for student role)
router.get('/materials', protect(['Student']), studentController.getClassMaterials);



// getting students by class id
router.get('/classes/:classId', protect(['Teacher']), studentController.getStudentsByClassId);

// url: htttp://localhost:9000/api/students/class/5



module.exports = router;
