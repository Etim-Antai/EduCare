const timetableModel = require('../models/timetableModel');
const teacherNotificationController = require('./teacherNotificationController'); // Import the notification controller

exports.addTimetableEntry = async (req, res) => {
    const { class_id, teacher_id, day_of_week, start_time, end_time, location } = req.body;

    // Validate input
    if (!class_id || !teacher_id || !day_of_week || !start_time || !end_time || !location) {
        return res.status(400).json({ message: 'Missing required fields: class_id, teacher_id, day_of_week, start_time, end_time, location' });
    }

    try {
        const timetableId = await timetableModel.addTimetableEntry(req.body);
        
        // Send notification to the teacher about the new timetable entry
        await teacherNotificationController.notifyTeacherOnTimetableCreation(teacher_id, class_id, day_of_week, start_time, end_time, location);

        res.status(201).json({ message: 'Timetable entry added successfully', timetableId });
    } catch (error) {
        console.error('Error adding timetable entry:', error);
        return res.status(error.message ? 400 : 500).json({ message: error.message || 'Server error' });
    }
};

exports.deleteTimetableEntry = async (req, res) => {
    const timetableId = req.params.id;

    // Validate timetableId
    if (!timetableId) {
        return res.status(400).json({ message: 'Timetable ID is required' });
    }

    try {
        const timetableEntry = await timetableModel.getTimetableById(timetableId); // Get current timetable entry details
        await timetableModel.deleteTimetableEntry(timetableId);

        // Notify the teacher that the timetable entry was deleted
        await teacherNotificationController.notifyTeacherOnTimetableDeletion(timetableEntry.teacher_id, timetableEntry.class_id);

        res.status(200).json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable entry:', error);
        return res.status(error.message ? 400 : 500).json({ message: error.message || 'Server error' });
    }
};

exports.getTimetable = async (req, res) => {
    try {
        const timetables = await timetableModel.getTimetable();
        res.status(200).json({ data: timetables });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTimetableById = async (req, res) => {
    const timetableId = req.params.id;

    // Validate timetableId
    if (!timetableId) {
        return res.status(400).json({ message: 'Timetable ID is required' });
    }

    try {
        const timetable = await timetableModel.getTimetableById(timetableId);
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }
        res.status(200).json({ data: timetable });
    } catch (error) {
        console.error('Error fetching timetable by ID:', error);
        return res.status(error.message ? 400 : 500).json({ message: error.message || 'Server error' });
    }
};

exports.updateTimetableEntry = async (req, res) => {
    const timetableId = req.params.id; // Use timetable ID from the route parameters
    const { class_id, teacher_id, day_of_week, start_time, end_time, location } = req.body;

    // Validate input
    if (!timetableId || !class_id || !teacher_id || !day_of_week || !start_time || !end_time) {
        return res.status(400).json({ message: 'Missing required fields: id, class_id, teacher_id, day_of_week, start_time, end_time, location' });
    }

    try {
        const updatedRows = await timetableModel.updateTimetableEntry(timetableId, req.body);
        
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Timetable entry not found or no changes made' });
        }

        // Notify the teacher about the update to the timetable
        await teacherNotificationController.notifyTeacherOnTimetableUpdate(teacher_id, class_id, day_of_week, start_time, end_time, location);

        res.status(200).json({ message: 'Timetable entry updated successfully' });
    } catch (error) {
        console.error('Error updating timetable entry:', error);
        return res.status(error.message ? 400 : 500).json({ message: error.message || 'Server error' });
    }
};

// This function fetches timetable entries for a specific class ID
exports.getTimetableByClassId = async (req, res) => {
    const classId = req.params.classId;

    try {
        const timetables = await timetableModel.getTimetableByClassId(classId); // Ensure this method exists in your model
        if (!timetables || timetables.length === 0) {
            return res.status(404).json({ message: 'No timetables found for this class.' });
        }
        res.status(200).json({ data: timetables });
    } catch (error) {
        console.error('Error fetching timetable by class ID:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
