// controllers/assignmentController.js
const Assignment = require('../models/assignmentModel');
const Notification = require('../models/notificationModel'); // Import notification model for sending notifications
const db = require('../config/db'); // Import database connection
// Function to simulate fetching students by class ID
async function getStudentsByClassId(classId) {
    // Fetch students for the given class (you will need to implement this logic based on your existing models)
    const [students] = await db.query('SELECT student_id FROM students WHERE class_id = ?', [classId]);
    return students;
}

exports.create = async (req, res) => {
    try {
        const { class_id, title, description, due_date, total_points } = req.body;
        // Create the assignment
        const newId = await Assignment.createAssignment({
            class_id,
            title,
            description,
            due_date,
            total_points,
        });

        // Fetch students in the associated class
        const students = await getStudentsByClassId(class_id); // Implementation-defined function

        // Send notifications to each student
        for (const student of students) {
            await Notification.createNotification({
                student_id: student.student_id,
                title: 'New Assignment Alert',
                message: `A new assignment titled "${title}" has been created. Please check it in your assignments.`,
                assignment_id: newId // Link to the newly created assignment
            });
        }

        res.status(201).json({ id: newId, message: 'Assignment created and notifications sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const assignments = await Assignment.getAllAssignments();
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    const id = req.params.id; // Capture the assignment ID from the request parameters
    try {
        const assignments = await Assignment.getAllAssignments(); // Fetch all assignments
        const assignment = assignments.find(a => a.assignment_id == id); // Find the assignment by ID

        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    const id = req.params.id; // Capture the assignment ID
    try {
        // First, check if the assignment exists
        const existingAssignments = await Assignment.getAllAssignments(); // Fetch all assignments
        const assignment = existingAssignments.find(a => a.assignment_id == id);

        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Proceed to update the assignment
        const { class_id, title, description, due_date, total_points } = req.body;
        await Assignment.updateAssignment(id, {
            class_id,
            title,
            description,
            due_date,
            total_points,
        });

        res.status(200).json({ message: 'Assignment updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id; // Capture the assignment ID
    try {
        await Assignment.deleteAssignment(id); // Delete the assignment
        res.status(204).send(); // No content response for successful deletion
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
