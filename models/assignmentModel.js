// models/assignmentModel.js
const db = require('../config/db'); // Import the MySQL connection pool

class Assignment {
    // Fetch all assignments
    static async getAllAssignments() {
        try {
            const [rows] = await db.query('SELECT * FROM assignments');
            return rows; // Return all rows fetched
        } catch (error) {
            throw new Error('Error fetching assignments: ' + error.message);
        }
    }

    // Create a new assignment
    static async createAssignment(assignmentData) {
        const { class_id, title, description, due_date, total_points } = assignmentData;
        try {
            const [result] = await db.query(
                `INSERT INTO assignments (class_id, title, description, due_date, total_points) 
                 VALUES (?, ?, ?, ?, ?)`,
                [class_id, title, description, due_date, total_points]
            );
            return result.insertId; // Return the newly created assignment ID
        } catch (error) {
            throw new Error('Error creating assignment: ' + error.message);
        }
    }

    // Update an assignment
    static async updateAssignment(assignmentId, assignmentData) {
        const { class_id, title, description, due_date, total_points } = assignmentData;
        try {
            await db.query(
                `UPDATE assignments 
                 SET class_id = ?, title = ?, description = ?, due_date = ?, total_points = ?
                 WHERE assignment_id = ?`, 
                [class_id, title, description, due_date, total_points, assignmentId]
            );
            return assignmentId; // Return the ID of the updated assignment
        } catch (error) {
            throw new Error('Error updating assignment: ' + error.message);
        }
    }

    // Delete an assignment
    static async deleteAssignment(assignmentId) {
        try {
            await db.query('DELETE FROM assignments WHERE assignment_id = ?', [assignmentId]);
            return assignmentId; // Return the deleted assignment ID
        } catch (error) {
            throw new Error('Error deleting assignment: ' + error.message);
        }
    }
}

module.exports = Assignment; // Export the Assignment class
