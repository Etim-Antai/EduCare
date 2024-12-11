const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import JWT for handling tokens

const stats = async (req, res) => {
    try {
        const [admins] = await db.query('SELECT COUNT(*) AS adminCount FROM admins');
        const [classes] = await db.query('SELECT COUNT(*) AS classCount FROM Classes');
        const [timetables] = await db.query('SELECT COUNT(*) AS timetableCount FROM Timetable');
        const [teachers] = await db.query('SELECT COUNT(*) AS teacherCount FROM teachers'); // Query for teachers
        const [students] = await db.query('SELECT COUNT(*) AS studentCount FROM students'); // Query for students

        res.status(200).json({
            message: 'Admin Dashboard Data',
            data: {
                adminCount: admins[0].adminCount,
                classCount: classes[0].classCount,
                timetableCount: timetables[0].timetableCount,
                teacherCount: teachers[0].teacherCount, // Include teacher count
                studentCount: students[0].studentCount  // Include student count
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Queries for Charts

// Teacher Distribution by Subject
const getTeacherDistribution = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT subject, COUNT(*) AS teacher_count
            FROM teachers 
            GROUP BY subject;
        `);
        res.status(200).json({ message: 'Teacher distribution retrieved successfully', data: results });
    } catch (error) {
        console.error('Error retrieving teacher distribution:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Student Enrollment Over Time
const getStudentEnrollmentOverTime = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT YEAR(enrollment_date) AS enrollment_year, 
                   MONTH(enrollment_date) AS enrollment_month, 
                   COUNT(*) AS student_count
            FROM students
            GROUP BY enrollment_year, enrollment_month
            ORDER BY enrollment_year, enrollment_month;
        `);
        res.status(200).json({ message: 'Student enrollment retrieved successfully', data: results });
    } catch (error) {
        console.error('Error retrieving student enrollment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Assignment Submissions per Class
const getAssignmentSubmissionsPerClass = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT c.class_name, COUNT(s.submission_id) AS submission_count
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.assignment_id  -- Join on assignments
            JOIN classes c ON a.class_id = c.class_id                -- Join on classes
            GROUP BY c.class_name;
        `);
        res.status(200).json({ message: 'Assignment submissions per class retrieved successfully', data: results });
    } catch (error) {
        console.error('Error retrieving assignment submissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Attendance Overview
const getAttendanceOverview = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT c.class_name,
                   AVG(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100 as average_attendance_percentage
            FROM attendance a
            JOIN classes c ON a.class_id = c.class_id
            GROUP BY c.class_name;
        `);
        res.status(200).json({ message: 'Attendance overview retrieved successfully', data: results });
    } catch (error) {
        console.error('Error retrieving attendance overview:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Notifications Summary
const getNotificationsSummary = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT type, COUNT(*) AS notification_count
            FROM admin_notifications
            GROUP BY type;
        `);
        res.status(200).json({ message: 'Notifications summary retrieved successfully', data: results });
    } catch (error) {
        console.error('Error retrieving notifications summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Management Functions

// Add a New Admin
const addAdmin = async (req, res) => {
    const { username, email, password, role, first_name, last_name, phone } = req.body;

    // Validate input
    if (!username || !email || !password || !role || !first_name || !last_name) {
        return res.status(400).json({ message: 'Missing required fields: username, email, password, role, first_name, last_name' });
    }

    try {
        const [existingAdmin] = await db.query('SELECT * FROM admins WHERE email = ? OR username = ?', [email, username]);
        if (existingAdmin.length > 0) {
            return res.status(400).json({ message: 'Email or username is already registered' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin into the database
        const [result] = await db.query(
            'INSERT INTO admins (username, email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, first_name, last_name, phone]
        );

        res.status(201).json({ message: 'Admin added successfully', adminId: result.insertId });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your actual JWT secret
        const adminId = decoded.id; // Ensure to fetch the correct field that holds the admin ID

        const [admin] = await db.query('SELECT * FROM admins WHERE admin_id = ?', [adminId]);
        if (admin.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ data: admin[0] });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(401).json({ message: 'Unauthorized access or invalid token' });
    }
};

// Update Admin
const updateAdmin = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your actual JWT secret
        const adminId = decoded.id; // Admin ID extracted from the token

        const { username, first_name, last_name, phone } = req.body;
        const updates = [];
        const values = [];

        // Check for each field and add to the update query if it exists
        if (username) {
            updates.push('username = ?');
            values.push(username);
        }
        if (first_name) {
            updates.push('first_name = ?');
            values.push(first_name);
        }
        if (last_name) {
            updates.push('last_name = ?');
            values.push(last_name);
        }
        if (phone) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        values.push(adminId);
        const updateQuery = `UPDATE admins SET ${updates.join(', ')} WHERE admin_id = ?`;
        console.log("Executing Update Query:", updateQuery, values); // Log the query and values

        const [result] = await db.query(updateQuery, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No admin found with this ID or no changes made' });
        }
        res.status(200).json({ message: 'Admin updated successfully' });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all admins
const getAdmins = async (req, res) => {
    try {
        const [admins] = await db.query('SELECT * FROM admins');
        res.status(200).json({ data: admins });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete an Admin
const deleteAdmin = async (req, res) => {
    const adminId = req.params.id;

    // Validate input
    if (!adminId) {
        return res.status(400).json({ message: 'Admin ID is required' });
    }

    try {
        await db.query('DELETE FROM admins WHERE admin_id = ?', [adminId]);
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a New Class
const addClass = async (req, res) => {
    const { className, teacherId, startDate, endDate } = req.body;

    // Validate input
    if (!className || !teacherId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields: className, teacherId, startDate, endDate' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO Classes (class_name, teacher_id, start_date, end_date) VALUES (?, ?, ?, ?)',
            [className, teacherId, startDate, endDate]
        );
        res.status(201).json({ message: 'Class added successfully', classId: result.insertId });
    } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// View Classes
const getClasses = async (req, res) => {
    try {
        const [classes] = await db.query('SELECT * FROM Classes');
        res.status(200).json({ data: classes });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Class Details
const updateClass = async (req, res) => {
    const classId = req.params.id;
    const { className, teacherId, startDate, endDate } = req.body;

    // Validate input
    if (!className && !teacherId && !startDate && !endDate) {
        return res.status(400).json({ message: 'No valid fields to update' });
    }

    try {
        await db.query(
            'UPDATE Classes SET class_name = ?, teacher_id = ?, start_date = ?, end_date = ? WHERE class_id = ?',
            [className, teacherId, startDate, endDate, classId]
        );
        res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a Class
const deleteClass = async (req, res) => {
    const classId = req.params.id;

    // Validate input
    if (!classId) {
        return res.status(400).json({ message: 'Class ID is required' });
    }

    try {
        await db.query('DELETE FROM Classes WHERE class_id = ?', [classId]);
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Register Student
const registerStudent = async (req, res) => {
    const { first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id } = req.body;

    if (!first_name || !last_name || !gender || !date_of_birth || !address || !contact_info || !email || !password || !enrollment_date || !class_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existingStudent] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
        if (existingStudent.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO students (first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, gender, date_of_birth, address, contact_info, email, hashedPassword, enrollment_date, class_id]
        );

        res.status(201).json({ message: 'Student registered successfully', studentId: result.insertId });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch Students with Class Names
const getAllStudents = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT s.*, c.class_name
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.deleted_at IS NULL
        `);
        const students = results;

        res.status(200).json({ message: 'Students retrieved successfully', students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Student by ID
const getStudentById = async (req, res) => {
    const { student_id } = req.params;

    if (!student_id || isNaN(student_id)) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    try {
        const [results] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        const student = results[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student retrieved successfully', student });
    } catch (error) {
        console.error('Error retrieving student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Student by ID
const updateStudentById = async (req, res) => {
    const { student_id } = req.params;
    const { first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id } = req.body;

    if (!first_name || !last_name || !gender || !date_of_birth || !address || !contact_info || !email || !password || !enrollment_date || !class_id) {
        return res.status(400).json({ message: 'All fields are required' });    
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {  
        const [results] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        const student = results[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'UPDATE students SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?, address = ?, contact_info = ?, email = ?, password = ?, enrollment_date = ?, class_id = ? WHERE student_id = ?',
            [first_name, last_name, gender, date_of_birth, address, contact_info, email, hashedPassword, enrollment_date, class_id, student_id]
        );  

        res.status(200).json({
            message: 'Student updated successfully',
            student: {
                student_id,
                first_name,
                last_name,
                gender,
                date_of_birth,
                address,
                contact_info,
                email,
                enrollment_date,
                class_id,
            }
        });
    } catch (error) {
        console.error('Error updating student:', error.message || error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Student by ID
const deleteStudentById = async (req, res) => {
    const { student_id } = req.params;

    if (!student_id || isNaN(student_id)) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    try {  
        const [results] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        const student = results[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await db.query('DELETE FROM students WHERE student_id = ?', [student_id]);
        
        res.status(200).json({
            message: 'Student deleted successfully'
        });
    } catch (error) {    
        console.error('Error deleting student:', error.message || error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Student Login
const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [results] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
        const student = results[0];

        if (!student) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: student.student_id, email: student.email, role: 'Student' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: student.student_id,
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email,
                subject: student.subject,
                phone: student.phone,
                hire_date: student.hire_date,
                role: student.role,
            }
        });
    } catch (error) {
        console.error('Error logging in student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// get all teachers
const getTeachers = async (req, res) => {
    try {
        const [teachers] = await db.query('SELECT * FROM teachers');
        res.status(200).json({ data: teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// add teachers
const addTeacher = async (req, res) => {
    const { first_name, last_name, email, password, subject, phone, hire_date } = req.body;

    if (!first_name || !last_name || !email || !password || !subject || !phone || !hire_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existingTeacher] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);
        if (existingTeacher.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO teachers (first_name, last_name, email, password, subject, phone, hire_date) VALUES (?, ?)',
            [first_name, last_name, email, hashedPassword, subject, phone, hire_date]
        );

        res.status(201).json({ message: 'Teacher added successfully', teacherId: result.insertId });
    } catch (error) {    
        console.error('Error adding teacher:', error);
        res.status(500).json({ message: 'Server error' });
    };
};



// update teacher
const updateTeacher = async (req, res) => {
    const teacherId = req.params.id;
    const { first_name, last_name, email, password, subject, phone, hire_date } = req.body;
    if (!first_name || !last_name || !email || !password || !subject || !phone || !hire_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existingTeacher] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);
        if (existingTeacher.length > 0 && existingTeacher[0].teacher_id !== parseInt(teacherId)) {
            return res.status(400).json({ message: 'Email is already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'UPDATE teachers SET first_name = ?, last_name = ?, email = ?, password = ?, subject = ?, phone = ?, hire_date = ? WHERE teacher_id = ?',
            [first_name, last_name, email, hashedPassword, subject, phone, hire_date, teacherId]
        );
        res.status(200).json({ message: 'Teacher updated successfully' });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// delete teacher
const deleteTeacher = async (req, res) => {
    const teacherId = req.params.id;

    if (!teacherId) {
        return res.status(400).json({ message: 'Teacher ID is required' });
    }

    try {
        await db.query('DELETE FROM teachers WHERE teacher_id = ?', [teacherId]);
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: 'Server error' });
    }
    };

// get class materials
const getClassMaterials = async (req, res) => {
    const { class_id } = req.params;
    if (!class_id || isNaN(class_id)) {
        return res.status(400).json({ message: 'Invalid class ID' });
        }
    try {
        const [results] = await db.query('SELECT * FROM materials WHERE class_id = ?', [class_id]);
        const materials = results;
        if (!materials) {
            return res.status(404).json({ message: 'Materials not found' });
        }
        res.status(200).json({ message: 'Materials retrieved successfully', materials });
    } catch (error) {
        console.error('Error retrieving materials:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// add class materials
const addClassMaterials = async (req, res) => {
    const { class_id, title, description, file_url } = req.body;
    if (!class_id || isNaN(class_id) || !title || !description || !file_url) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO materials (class_id, title, description, file_url) VALUES (?, ?, ?, ?)',
            [class_id, title, description, file_url]
        );
        res.status(201).json({ message: 'Material added successfully', materialId: result.insertId });
            } catch (error) {
                console.error('Error adding material:', error);
        res.status(500).json({ message: 'Server error' });
        }
    };

// get timetable
const getTimetable = async (req, res) => {
    const { class_id } = req.params;
    if (!class_id || isNaN(class_id)) {
        return res.status(400).json({ message: 'Invalid class ID' });
    }
    try {
        const [results] = await db.query('SELECT * FROM timetable WHERE class_id = ?', [class_id]);
        const timetable = results;
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        res.status(200).json({ message: 'Timetable retrieved successfully', timetable });
    } catch (error) {
        console.error('Error retrieving timetable:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// add timetable
const addTimetable = async (req, res) => {
    const { class_id, subject, teacher_id, day, start_time, end_time } = req.body;
    if (!class_id || isNaN(class_id) || !subject || !teacher_id || !day || !start_time || !end_time) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO timetable (class_id, subject, teacher_id, day, start_time, end_time) VALUES (?, ?)',
            [class_id, subject, teacher_id, day, start_time, end_time]
        );
        res.status(201).json({ message: 'Timetable added successfully', timetableId: result.insertId });
    } catch (error) {
        console.error('Error adding timetable:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



















const getGradesDistribution = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT class_id, AVG(score) AS average_grade
            FROM grades
            GROUP BY class_id;
        `);

        res.status(200).json({
            message: 'Grades Distribution Data',
            data: results
        });
    } catch (error) {
        console.error('Error fetching grades distribution:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getAttendanceTrends = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                MONTH(date) AS month,
                YEAR(date) AS year,  -- Include the year for clearer trend analysis
                (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS average_attendance
            FROM attendance
            GROUP BY YEAR(date), MONTH(date)
            ORDER BY YEAR(date), MONTH(date);
        `);

        res.status(200).json({
            message: 'Attendance Trends Data',
            data: results
        });
    } catch (error) {
        console.error('Error fetching attendance trends:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




const getAssignmentSubmissionRates = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT a.class_id, 
                   COUNT(s.submission_id) AS submission_count, 
                   COUNT(a.assignment_id) AS total_assignments
            FROM assignments a
            LEFT JOIN submissions s ON a.assignment_id = s.assignment_id
            GROUP BY a.class_id;
        `);

        res.status(200).json({
            message: 'Assignment Submission Rates Data',
            data: results
        });
    } catch (error) {
        console.error('Error fetching assignment submission rates:', error);
        res.status(500).json({ message: 'Server error' });
    }
};















// Export all the required functions
module.exports = {
    stats,
    getTeacherDistribution,
    getStudentEnrollmentOverTime,
    getAssignmentSubmissionsPerClass,
    getAttendanceOverview,
    getNotificationsSummary,
    addAdmin,
    getAdminProfile,
    updateAdmin,
    getAdmins,
    deleteAdmin,
    addClass,
    getClasses,
    updateClass,
    deleteClass,
    registerStudent,
    getAllStudents,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    loginStudent,
    getTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getClassMaterials,
    addClassMaterials,
    getTimetable,
    addTimetable,
    getGradesDistribution,
    getAttendanceTrends,
    getAssignmentSubmissionRates
};
