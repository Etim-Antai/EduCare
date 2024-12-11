// controllers/classMaterialController.js
const ClassMaterial = require('../models/classMaterialModel');
const { createClassMaterialPostedNotification } = require('../utils/notificationUtils'); // Import the notification utility
const db = require('../config/db'); // Import the db connection

// Function to fetch students by class ID
async function getStudentsByClassId(classId) {
    const [students] = await db.query('SELECT student_id FROM students WHERE class_id = ?', [classId]);
    console.log('Fetched students for class ID:', classId, '=>', students); // Log fetched students for debugging
    return students; // Return the fetched students
}

// Create a new class material and send notifications
exports.create = async (req, res) => {
    try {
        const { class_id, title, description, file_url, uploaded_by } = req.body;

        // Validate all required fields
        if (!class_id || !title || !file_url || !uploaded_by) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Create the class material
        const newId = await ClassMaterial.addMaterial({
            class_id,
            title,
            description,
            file_url,
            uploaded_by
        });

        console.log('New class material created with ID:', newId); // Log for verification

        // If ID is not returned as expected, log an error
        if (!newId) {
            console.error('Material creation failed, ID is undefined.'); 
            return res.status(500).json({ error: 'Failed to create class material.' });
        }

        // Fetch students in the associated class
        const students = await getStudentsByClassId(class_id); // Fetch students for the given class

        // Send notifications for the new material to students
        const notificationPromises = students.map(student => 
            createClassMaterialPostedNotification(uploaded_by, newId) // Use the function to log the notification
        );

        // Await all notifications to be sent
        await Promise.all(notificationPromises);

        res.status(201).json({ 
            id: newId, 
            message: 'Class material uploaded successfully and notifications sent.'
        });
    } catch (error) {
        console.error('Error creating class material:', error);
        res.status(500).json({ error: error.message });
    }
};

// Fetch materials for a specific class
exports.getMaterialsForClass = async (req, res) => {
    const classId = req.params.class_id; // Get class ID from request parameters
    try {
        const materials = await ClassMaterial.getMaterialsByClassId(classId);
        res.status(200).json(materials); // Return materials as JSON response
    } catch (error) {
        res.status(500).json({ error: error.message }); // Return error message
    }
};

// Delete a class material
exports.deleteMaterial = async (req, res) => {
    const materialId = req.params.material_id; // Get material ID from request parameters
    try {
        const material = await ClassMaterial.deleteMaterialById(materialId);
        if (material) {
            res.status(200).json({ message: 'Class material deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Class material not found.' });
        }
    } catch (error) {
        console.error('Error deleting class material:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all class materials
exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await ClassMaterial.getAllMaterials();
        res.status(200).json(materials); // Return materials as JSON response
    } catch (error) {
        console.error('Error fetching all class materials:', error);
        res.status(500).json({ error: error.message }); // Return error message
    }
};
