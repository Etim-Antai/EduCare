const express = require('express');
const {
    markAttendance,
    getAttendanceRecords,
    getAttendanceByStudentId,
    getAttendanceByClassId
} = require('../controllers/attendanceController');
const { protect, checkRole } = require('../middleware/authMiddleware'); // Assuming checkRole is imported from authMiddleware

const router = express.Router();

// Route for marking attendance - only accessible by teachers
router.post('/mark', protect(), checkRole('Teacher'), markAttendance); 

// Route for getting all attendance records - accessible to any authenticated user
router.get('/records', protect(), getAttendanceRecords); // Get all attendance records

// Route for getting attendance by student ID - accessible by admins and teachers
router.get('/student/:studentId', protect(), checkRole('Admin', 'Teacher'), getAttendanceByStudentId);

// Route for getting attendance by class ID - accessible to both admins and teachers
router.get('/class/:classId', protect(), checkRole('Admin', 'Teacher'), getAttendanceByClassId);

module.exports = router;
