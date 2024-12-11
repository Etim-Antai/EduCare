const ClassMaterial = require('../models/classMaterialModel');
const Notification = require('../models/notificationModel'); // Import notification model
const db = require('../config/db'); // Import the database connection
const teacherModel = require('../models/teacherModel'); // Import the teacher model

// Function to fetch students by class ID
async function getStudentsByClassId(classId) {
    const [students] = await db.query('SELECT student_id FROM students WHERE class_id = ?', [classId]);
    console.log('Fetched students for class ID:', classId, '=>', students); // Log fetched students for debugging
    return students; // Return the fetched students
}

// Add a New Teacher
exports.addTeacher = async (req, res) => {
    // Add teacher validation logic here (using Joi or other method)
    // Example validation omitted for brevity
    try {
        const teacherId = await teacherModel.addTeacher(req.body);
        res.status(201).json({ message: 'Teacher added successfully', teacherId });
    } catch (error) {
        console.error('Error adding teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Teacher Details
exports.updateTeacher = async (req, res) => {
    const teacherId = req.params.id;

    try {
        const teacher = await teacherModel.getTeacherById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        await teacherModel.updateTeacher(teacherId, req.body);
        res.status(200).json({ message: 'Teacher updated successfully' });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a Teacher
exports.deleteTeacher = async (req, res) => {
    const teacherId = req.params.id;

    try {
        const teacher = await teacherModel.getTeacherById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        await teacherModel.deleteTeacher(teacherId);
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Teachers
exports.getAllTeachers = async (req, res) => {
    const { search = '' } = req.query;

    try {
        const teachers = await teacherModel.getTeachers(search);
        res.status(200).json({ data: teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Teacher Details by ID
exports.getTeacherById = async (req, res) => {
    const teacherId = req.params.id;

    try {
        const teacher = await teacherModel.getTeacherById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        res.status(200).json({ data: teacher });
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await teacherModel.getAllStudents(); // Method to fetch students
        res.status(200).json({ data: students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add Class Material
exports.addClassMaterial = async (req, res) => {
    const { class_id, title, description, file_url } = req.body;

    // Validate input
    if (!class_id || !title || !file_url) {
        return res.status(400).json({ message: 'Class ID, title, and file URL are required' });
    }

    try {
        const uploaded_by = req.user.id; // The teacher's ID from the authenticated JWT token

        // Insert the material
        const materialId = await ClassMaterial.addMaterial({
            class_id,
            title,
            description,
            file_url,
            uploaded_by
        });

        console.log('Class material created with ID:', materialId); // Log for verification

        // Fetch students in the associated class
        const students = await getStudentsByClassId(class_id); // Fetch students for the given class

        // Send notifications for the new material to students
        for (const student of students) {
            await Notification.createNotification({
                student_id: student.student_id,
                title: 'New Class Material Alert',
                message: `New material titled "${title}" has been uploaded. Please check it in your materials.`,
                material_id: materialId // Link to the newly created material
            });
            console.log('Notification sent to student ID:', student.student_id); // Log notification action
        }

        res.status(201).json({
            message: 'Class material uploaded successfully',
            materialId,
        });
    } catch (error) {
        console.error('Error adding class material:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch class materials uploaded by the teacher
exports.getClassMaterialsByTeacher = async (req, res) => {
    const teacherId = req.user.id; // Get the teacher ID from the authenticated JWT token

    try {
        const materials = await teacherModel.getClassMaterialsByTeacherId(teacherId);
        if (materials.length === 0) {
            return res.status(404).json({ message: 'No materials found for this teacher' });
        }

        res.status(200).json({ data: materials });
    } catch (error) {
        console.error('Error fetching materials uploaded by teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch class materials by class ID (if needed separately)
exports.getClassMaterialsByClassId = async (req, res) => {
    const { classId } = req.params; // Retrieve class ID from route parameters

    try {
        const materials = await teacherModel.getClassMaterialsByClassId(classId);
        if (materials.length === 0) {
            return res.status(404).json({ message: 'No materials found for this class' });
        }

        res.status(200).json({ data: materials });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Teacher Profile
exports.getTeacherProfile = async (req, res) => {
    const teacherId = req.user.id; // The ID of the authenticated teacher

    try {
        const teacher = await teacherModel.getTeacherById(teacherId); // Use the existing method to fetch profile
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        
        res.status(200).json({ data: teacher });
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
