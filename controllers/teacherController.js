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

// Fetch teacher statistics for the dashboard
exports.getTeacherDashboardStats = async (req, res) => {
    const teacherId = req.user.id; // Get the authenticated teacher's ID

    try {
        // Fetching counts of all students related to the classes taught by this teacher
        const [totalStudents] = await db.query(
            'SELECT COUNT(student_id) AS total_students FROM students WHERE class_id IN (SELECT class_id FROM classes WHERE teacher_id = ?)', 
            [teacherId]
        );

        // Fetching counts of all classes available in the school
        const [totalClasses] = await db.query(
            'SELECT COUNT(class_id) AS total_classes FROM classes'
        );

        // Fetching counts of all assignments available in the school
        const [totalAssignments] = await db.query(
            'SELECT COUNT(assignment_id) AS total_assignments FROM assignments'
        );

        res.status(200).json({
            totalStudents: totalStudents[0].total_students,
            totalClasses: totalClasses[0].total_classes,
            totalAssignments: totalAssignments[0].total_assignments,
        });
    } catch (error) {
        console.error('Error fetching teacher dashboard statistics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch average grades per class for the dashboard
exports.getAvgGradesByClass = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const result = await db.query(`
            SELECT c.class_id, c.class_name, AVG(g.score) AS avg_grade 
            FROM classes c 
            LEFT JOIN grades g ON c.class_id = g.class_id 
            WHERE c.teacher_id = ? 
            GROUP BY c.class_id
        `, [teacherId]);

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching average grades by class:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch attendance records for the dashboard
exports.getAttendanceStats = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const attendanceStats = await db.query(`
            SELECT c.class_id, c.class_name, a.status, COUNT(*) AS count 
            FROM attendance a 
            JOIN classes c ON a.class_id = c.class_id 
            WHERE c.teacher_id = ?
            GROUP BY a.class_id, a.status
        `, [teacherId]);

        res.status(200).json({ data: attendanceStats });
    } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch assignment submission rates
exports.getAssignmentSubmissionRates = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const submissionRates = await db.query(`
            SELECT a.assignment_id, 
                   a.title,
                   COUNT(s.submission_id) AS submission_count, 
                   COUNT(s.submission_id) / COUNT(DISTINCT st.student_id) * 100 AS submission_rate 
            FROM assignments a 
            LEFT JOIN submissions s ON a.assignment_id = s.assignment_id 
            LEFT JOIN students st ON st.class_id IN (SELECT class_id FROM classes WHERE teacher_id = ?) 
            WHERE a.class_id IN (SELECT class_id FROM classes WHERE teacher_id = ?)
            GROUP BY a.assignment_id
        `, [teacherId, teacherId]);

        res.status(200).json({ data: submissionRates });
    } catch (error) {
        console.error('Error fetching assignment submission rates:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch total students by class
exports.getTotalStudentsByClass = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const result = await db.query(`
            SELECT c.class_id, c.class_name, COUNT(s.student_id) AS total_students 
            FROM classes c 
            LEFT JOIN students s ON s.class_id = c.class_id 
            WHERE c.teacher_id = ?
            GROUP BY c.class_id
        `, [teacherId]);

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching total students by class:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch assignments completion statistics
exports.getAssignmentsCompletionStats = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const result = await db.query(`
            SELECT a.class_id, 
                   SUM(CASE WHEN s.graded = 1 THEN 1 ELSE 0 END) AS completed_assignments,
                   COUNT(a.assignment_id) AS total_assignments 
            FROM assignments a 
            LEFT JOIN submissions s ON a.assignment_id = s.assignment_id 
            WHERE a.class_id IN (SELECT class_id FROM classes WHERE teacher_id = ?)
            GROUP BY a.class_id
        `, [teacherId]);

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching assignment completion statistics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch overall attendance statistics by class
exports.getOverallAttendanceStats = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const result = await db.query(`
            SELECT 
                c.class_id, 
                c.class_name,
                COUNT(a.attendance_id) AS total_attendance,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS total_present
            FROM classes c 
            LEFT JOIN attendance a ON a.class_id = c.class_id 
            WHERE c.teacher_id = ?
            GROUP BY c.class_id
        `, [teacherId]);

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching overall attendance statistics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch recent submission rates over the last 30 days
exports.getRecentSubmissionRates = async (req, res) => {
    const teacherId = req.user.id;

    try {
        const result = await db.query(`
            SELECT 
                a.assignment_id,
                a.title,
                COUNT(s.submission_id) AS submission_count,
                COUNT(s.submission_id) / COUNT(DISTINCT st.student_id) * 100 AS submission_rate 
            FROM assignments a 
            LEFT JOIN submissions s ON a.assignment_id = s.assignment_id 
            LEFT JOIN students st ON st.class_id IN (SELECT class_id FROM classes WHERE teacher_id = ?) 
            WHERE a.created_at >= NOW() - INTERVAL 30 DAY
            GROUP BY a.assignment_id
        `, [teacherId]);

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching recent submission rates:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
