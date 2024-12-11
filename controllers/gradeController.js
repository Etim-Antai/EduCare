const gradeModel = require('../models/gradeModel');

exports.addGrade = async (req, res) => {
    const { student_id, class_id, term, score } = req.body;

    // Validate input
    if (!student_id || !class_id) {
        return res.status(400).json({ message: 'Missing required fields: student_id, class_id' });
    }

    try {
        const gradeId = await gradeModel.addGrade(req.body);
        res.status(201).json({ message: 'Grade added successfully', gradeId });
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateGrade = async (req, res) => {
    const gradeId = req.params.id;

    if (!req.body) {
        return res.status(400).json({ message: 'No valid fields to update' });
    }

    try {
        await gradeModel.updateGrade(gradeId, req.body);
        res.status(200).json({ message: 'Grade updated successfully' });
    } catch (error) {
        console.error('Error updating grade:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteGrade = async (req, res) => {
    const gradeId = req.params.id;

    if (!gradeId) {
        return res.status(400).json({ message: 'Grade ID is required' });
    }

    try {
        await gradeModel.deleteGrade(gradeId);
        res.status(200).json({ message: 'Grade deleted successfully' });
    } catch (error) {
        console.error('Error deleting grade:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getGrades = async (req, res) => {
    try {
        const grades = await gradeModel.getGrades();
        res.status(200).json({ data: grades });
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
