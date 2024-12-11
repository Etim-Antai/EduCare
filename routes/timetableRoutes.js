const express = require('express');
const {
    addTimetableEntry,
    deleteTimetableEntry,
    getTimetable,
    updateTimetableEntry,
    getTimetableById,
    getTimetableByClassId // Assuming you have this function
} = require('../controllers/timetableController');
const { protect, isAdmin, isTeacher, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.post('/timetable', protect(), isAdmin, addTimetableEntry); // Admin: Create a new timetable entry
router.delete('/timetable/:id', protect(), isAdmin, deleteTimetableEntry); // Admin: Delete a timetable entry by ID

// Teacher routes and admin routes
router.put('/timetable/:id', protect(), [isAdmin, isTeacher], updateTimetableEntry); // Admin or Teacher: Update a timetable entry

// Shared routes (Admin, Teacher, Student)
router.get('/timetable', protect(), getTimetable); // All roles: Get all timetable entries
router.get('/timetable/:id', protect(), getTimetableById); // All roles: Get timetable entry by ID

// Single route for getting timetable by classId (accessible by admins and students)
router.get('/timetable/class/:classId', protect(), [isAdmin, isStudent], getTimetableByClassId); // Admin and Student: Get timetable by class

module.exports = router;
