// models/classMaterialModel.js
const db = require('../config/db'); // Import the MySQL connection pool

class ClassMaterial {
    // Add a new class material
    static async addMaterial(materialData) {
        const { class_id, title, description, file_url, uploaded_by } = materialData;

        try {
            const [result] = await db.query(
                `INSERT INTO classmaterials (class_id, title, description, file_url, uploaded_by) 
                 VALUES (?, ?, ?, ?, ?)`,
                [class_id, title, description, file_url, uploaded_by]
            );

            // Log the result for debugging
            console.log('Material inserted with ID:', result.insertId); // Added logging for verification
            return result.insertId; // Return the newly created material ID
        } catch (error) {
            console.error('Error adding class material:', error);
            throw new Error('Error creating class material: ' + error.message); // Improved error handling
        }
    }

    // Get all materials 
    static async getAllMaterials() {
        try {
            const [materials] = await db.query('SELECT * FROM classmaterials');
            return materials; // Return all materials
        } catch (error) {
            console.error('Error fetching all materials:', error);
            throw new Error('Error fetching all materials: ' + error.message); // Improved error handling
        }
    }

    // Get all materials for a specific class
    static async getMaterialsByClassId(classId) {
        try {
            const [materials] = await db.query('SELECT * FROM classmaterials WHERE class_id = ?', [classId]);
            return materials; // Return materials fetched for the specific class
        } catch (error) {
            console.error('Error fetching materials for class:', error);
            throw new Error('Error fetching materials: ' + error.message); // Improved error handling
        }
    }
}

module.exports = ClassMaterial; // Export the ClassMaterial class
