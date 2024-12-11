/* The above code is a Node.js application that handles authentication and CRUD operations for admins,
teachers, and students in a school management system. Here is a summary of the main functionalities: */
const db = require('../config/db');
const jwt = require('jsonwebtoken'); // Import JWT for handling tokens
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed using npm
const Joi = require('joi'); // Import Joi for validation
const {
    createAdminRetrievalNotification,
    createTeacherLoginNotification,
    createStudentLoginNotification,
    createStudentRegistrationNotification,
} = require('../utils/notificationUtils'); // Import notification utility functions

// Admin Login
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Retrieve the admin from the database
        const [results] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        const admin = results[0];

        // Check if the admin exists
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last_login with the current timestamp
        await db.query('UPDATE admins SET last_login = NOW() WHERE admin_id = ?', [admin.admin_id]);

        // Create a JWT token
        const token = jwt.sign(
            { id: admin.admin_id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Automatically log the admin login action
        await createAdminRetrievalNotification(admin.admin_id); // Call to log the admin login notification

        // Respond with token and admin info  
        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin.admin_id,
                email: admin.email,
                role: admin.role,
                first_name: admin.first_name,
                last_name: admin.last_name,
                username: admin.username
            }
        });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Registration
const registerAdmin = async (req, res) => {
    const { username, email, password, role, first_name, last_name, phone } = req.body;

    // Validate input
    if (!username || !email || !password || !role || !first_name || !last_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the email or username is already in use
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

        res.status(201).json({ message: 'Admin registered successfully', adminId: result.insertId });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required' });
    }

    try {
        // Retrieve the admin from the database
        const [results] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        const admin = results[0];

        // Check if the admin exists
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await db.query('UPDATE admins SET password = ? WHERE email = ?', [hashedPassword, email]);

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM admins');
        const admins = results;

        res.status(200).json({
            message: 'Admins retrieved successfully',
            admins 
        });
    } catch (error) {
        console.error('Error retrieving admins:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get admin by ID
const getAdminById = async (req, res) => {
    const { admin_id } = req.params;

    // Validate admin_id
    if (!admin_id || isNaN(admin_id)) {
        return res.status(400).json({ message: 'Invalid admin ID' });
    }

    try {
        const [results] = await db.query('SELECT * FROM admins WHERE admin_id = ?', [admin_id]);
        const admin = results[0];

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Log the retrieval of this admin
        await createAdminRetrievalNotification(admin_id);

        res.status(200).json({
            message: 'Admin retrieved successfully',
            admin 
        });
    } catch (error) {
        console.error('Error retrieving admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM teachers');
        const teachers = results;
        res.status(200).json({
            message: 'Teachers retrieved successfully',
            teachers 
        });
    } catch (error) {
        console.error('Error retrieving teachers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get teacher by ID
const getTeacherById = async (req, res) => {
    const { teacher_id } = req.params;

    // Validate teacher_id
    if (!teacher_id || isNaN(teacher_id)) {
        return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    try {
        const [results] = await db.query('SELECT * FROM teachers WHERE teacher_id = ?', [teacher_id]);
        const teacher = results[0];

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json({
            message: 'Teacher retrieved successfully',
            teacher 
        });
    } catch (error) {
        console.error('Error retrieving teacher:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update teacher by ID
const updateTeacherById = async (req, res) => {
    const { teacher_id } = req.params;
    const { first_name, last_name, subject, phone, email, password, hire_date } = req.body;

    // Validate input
    if (!first_name || !last_name || !subject || !phone || !email || !password || !hire_date) {
        return res.status(400).json({ message: 'All fields are required' });    
    }

    // Example of simple email validation (more complex checks can be applied)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {  
        // Check if the teacher exists
        const [results] = await db.query('SELECT * FROM teachers WHERE teacher_id = ?', [teacher_id]);
        const teacher = results[0];
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the teacher in the database
        await db.query(
            'UPDATE teachers SET first_name = ?, last_name = ?, subject = ?, phone = ?, email = ?, password = ?, hire_date = ? WHERE teacher_id = ?',
            [first_name, last_name, subject, phone, email, hashedPassword, hire_date, teacher_id]
        );

        res.status(200).json({
            message: 'Teacher updated successfully',
            teacher: { 
                teacher_id, 
                first_name, 
                last_name, 
                subject, 
                phone, 
                email, 
                hire_date 
            }
        });
    } catch (error) {
        console.error('Error updating teacher:', error.message || error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete teacher by ID
const deleteTeacherById = async (req, res) => {
    const { teacher_id } = req.params;

    // Validate teacher_id
    if (!teacher_id || isNaN(teacher_id)) {
        return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    try {  
        // Check if teacher exists
        const [results] = await db.query('SELECT * FROM teachers WHERE teacher_id = ?', [teacher_id]);
        const teacher = results[0];
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Delete the teacher from the database
        await db.query('DELETE FROM teachers WHERE teacher_id = ?', [teacher_id]);
        
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {    
        console.error('Error deleting teacher:', error.message || error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Register Student
const registerStudent = async (req, res) => {
    const { first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id } = req.body;

    // Validate input
    const missingFields = [];
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!gender) missingFields.push('gender');
    if (!date_of_birth) missingFields.push('date_of_birth');
    if (!address) missingFields.push('address');
    if (!contact_info) missingFields.push('contact_info');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!enrollment_date) missingFields.push('enrollment_date');
    if (!class_id) missingFields.push('class_id');

    // Log missing fields if any
    if (missingFields.length > 0) {
        console.error('Missing fields:', missingFields);
        return res.status(400).json({ message: 'All fields are required: ' + missingFields.join(', ') });
    }

    try {
        // Check if the email is already in use
        const [existingStudent] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
        if (existingStudent.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new student into the database
        const [result] = await db.query(
            'INSERT INTO students (first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, gender, date_of_birth, address, contact_info, email, hashedPassword, enrollment_date, class_id]
        );

        // Log the student registration action
        await createStudentRegistrationNotification(result.insertId); // Log the registration notification

        res.status(201).json({ message: 'Student registered successfully', studentId: result.insertId });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch Students with Class Names
const getAllStudents= async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT s.*, c.class_name
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.deleted_at IS NULL
        `); // Join query to get class names
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

    // Validate student_id
    if (!student_id || isNaN(student_id)) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    try {
        const [results] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        const student = results[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({
            message: 'Student retrieved successfully',
            student 
        });
    } catch (error) {
        console.error('Error retrieving student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Student by ID
const updateStudentById = async (req, res) => {
    const { student_id } = req.params;
    const { first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id } = req.body;

    // Validate input
    if (!first_name || !last_name || !gender || !date_of_birth || !address || !contact_info || !email || !password || !enrollment_date || !class_id) {
        return res.status(400).json({ message: 'All fields are required' });    
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {  
        // Check if student exists
        const [results] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        const student = results[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the student in the database
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

    // Validate student_id
    if (!student_id || isNaN(student_id)) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    try {  
        // Check if student exists
        const [results] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        const student = results[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete the student from the database
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

        // Log the student login action
        await createStudentLoginNotification(student.student_id); // Log this login action

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

// Validation schema for registering a teacher
const teacherSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    subject: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{11}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    hire_date: Joi.date().required(),
});

// Add a New Teacher
const registerTeacher = async (req, res) => {
    const { error } = teacherSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        // Check if the teacher already exists
        const existingTeacher = await db.query('SELECT * FROM teachers WHERE email = ?', [req.body.email]);
        if (existingTeacher[0][0]) return res.status(400).json({ message: 'Email is already registered' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Insert new teacher into the database
        await db.query('INSERT INTO teachers (first_name, last_name, subject, phone, email, password, hire_date, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [req.body.first_name, req.body.last_name, req.body.subject, req.body.phone, req.body.email, hashedPassword, req.body.hire_date, 'Teacher']
        );

        // Log the teacher registration action
        await createTeacherRegistrationNotification(req.body.email); // Log this registration action

        res.status(201).json({ message: 'Teacher registered successfully' });
    } catch (error) {
        console.error('Error registering teacher:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login Teacher
const loginTeacher = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [results] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);
        const teacher = results[0];

        if (!teacher) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: teacher.teacher_id, email: teacher.email, role: 'Teacher' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Log the teacher login action
        await createTeacherLoginNotification(teacher.teacher_id); // Log this login action

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: teacher.teacher_id,
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                email: teacher.email,
                subject: teacher.subject,
                phone: teacher.phone,
                hire_date: teacher.hire_date,
                role: teacher.role,
            }
        });
    } catch (error) {
        console.error('Error logging in teacher:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Export all the required functions
module.exports = {
    loginAdmin,
    registerAdmin,
    resetPassword,
    getAllAdmins,
    registerTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacherById,
    deleteTeacherById,
    registerStudent,
    getAllStudents,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    loginTeacher,
    loginStudent,
    getAdminById,
};
