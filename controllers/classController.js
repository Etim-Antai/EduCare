const classModel = require('../models/classModel');
const teacherNotificationController = require('./teacherNotificationController'); // Import the notification controller

exports.addClass = async (req, res) => {
    const { class_name, teacher_id, start_date, end_date, time_of_day } = req.body;

    // Validate input
    if (!class_name || !teacher_id) {
        return res.status(400).json({ message: 'Missing required fields: class_name, teacher_id' });
    }

    try {
        const classId = await classModel.addClass(req.body);
        
        // Notify the teacher about the new class creation
        await teacherNotificationController.notifyTeacherOnClassCreation(teacher_id, class_name);

        res.status(201).json({ message: 'Class added successfully', classId });
    } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateClass = async (req, res) => {
    const classId = req.params.id;

    if (!req.body) {
        return res.status(400).json({ message: 'No valid fields to update' });
    }

    try {
        await classModel.updateClass(classId, req.body);
        res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteClass = async (req, res) => {
    const classId = req.params.id;

    if (!classId) {
        return res.status(400).json({ message: 'Class ID is required' });
    }

    try {
        // Assuming you can get the teacher's ID from the class model if needed for notifications
        const classDetails = await classModel.getClassById(classId); // Fetch class to get its details
        await classModel.deleteClass(classId);

        // Notify the teacher that the class was deleted
        await teacherNotificationController.notifyTeacherOnClassDeletion(classDetails.teacher_id, classDetails.class_name);

        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getClasses = async (req, res) => {
    try {
        const classes = await classModel.getClasses();
        res.status(200).json({ data: classes });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
