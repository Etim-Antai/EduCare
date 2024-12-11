// controllers/attendanceController.js
const db = require('../config/db'); // Import the db connection
const attendanceModel = require('../models/attendanceModel'); // Import the attendance model
const { createAttendanceMarkedNotification } = require('../utils/notificationUtils');  // Import notification utility

// Mark Attendance

    exports.markAttendance = async (req, res) => {
        const attendanceRecords = req.body; // Now expect an array
    
        // Validate input
        if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
            return res.status(400).json({ message: 'No attendance data provided.' });
        }
    
        // Loop through each attendance record
        try {
            const teacher_id = req.user.id; // The teacher's ID from the authenticated JWT token
            const attendanceIds = [];
    
            for (const record of attendanceRecords) {
                const { student_id, class_id, date, status } = record;
                // Validate each record
                if (!student_id || !class_id || !date || !status) {
                    return res.status(400).json({ message: 'Missing required fields in record.' });
                }
    
                // Create attendance record in the database
                const attendanceId = await attendanceModel.createAttendance({ student_id, class_id, date, status, teacher_id });
                attendanceIds.push(attendanceId);
            }
    
            // Automatically log the attendance marking for each record (if applicable)
            for (const attendanceId of attendanceIds) {
                await createAttendanceMarkedNotification(teacher_id, attendanceId); // Create notification for attendance marked
            }
    
            res.status(201).json({
                message: 'Attendance marked successfully for all records.',
                attendanceIds
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
    

// Get attendance records by student ID
exports.getAttendanceByStudentId = async (req, res) => {
    const studentId = req.params.studentId;

    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    try {
        const attendanceRecords = await attendanceModel.getAttendanceByStudentId(studentId);
        res.status(200).json({ data: attendanceRecords });
    } catch (error) {
        console.error('Error fetching attendance by student ID:', error);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
};

// Get attendance records by class ID
exports.getAttendanceByClassId = async (req, res) => {
    const classId = req.params.classId;

    if (!classId) {
        return res.status(400).json({ message: 'Class ID is required' });
    }

    try {
        const attendanceRecords = await attendanceModel.getAttendanceByClassId(classId);
        res.status(200).json({ data: attendanceRecords });
    } catch (error) {
        console.error('Error fetching attendance by class ID:', error);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
};


// get  all attendance records
exports.getAttendanceRecords = async (req, res) => {
    try {
        const attendanceRecords = await attendanceModel.getAttendance();
        res.status(200).json({ data: attendanceRecords });

    } catch (error) {
        console.error('Error fetching all attendance records:', error);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
};