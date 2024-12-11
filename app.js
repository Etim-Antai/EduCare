// Load environment variables
require('dotenv').config();
const cors = require('cors');
const path = require('path');
require('./scheduler'); // Adjust path if needed

// Import dependencies
const express = require('express');
const morgan = require('morgan'); // For logging HTTP requests
const mysql = require('mysql2'); // For database connection


// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const questionRoutes = require('./routes/questionRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const classMaterialRoutes = require('./routes/classMaterialRoutes');
const classRoutes = require('./routes/classRoutes'); // Adjust path as needed
const teacherNotificationRoutes = require('./routes/teacherNotificationRoutes');

// Import authentication middleware
const { protect, isAdmin } = require('./middleware/authMiddleware'); // Adjust the path as needed

// Validate environment variables
if (
    !process.env.DB_HOST ||
    !process.env.DB_USER ||
    !process.env.DB_PASS ||
    !process.env.DB_NAME ||
    !process.env.JWT_SECRET
) {
    console.error('Missing required environment variables. Please check the .env file.');
    process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: 'http://yourfrontendurl.com', // Update with your frontend's URL during production
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.use(morgan('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/teachers', teacherRoutes); // Teacher routes
app.use('/api/students', studentRoutes); // Student routes
app.use('/api/notifications', notificationRoutes); // Notification routes
app.use('/api/attendance', attendanceRoutes); // Attendance routes
app.use('/api/timetable', timetableRoutes); // Timetable routes
app.use('/api/assignments', assignmentRoutes); // Assignment routes
app.use('/api/submissions', submissionRoutes); // Submission routes
app.use('/api/questions', questionRoutes); // Question bank routes
app.use('/api/admin-notifications', adminNotificationRoutes); // Admin notification routes
app.use('/api/class-materials', classMaterialRoutes); // Class material routes
app.use('/api/classes', classRoutes); // Class routes
app.use('/api/teacher-notifications', teacherNotificationRoutes);


// Endpoint for marking notifications as read
app.patch('/api/admin-notifications/:id/read', protect(), async (req, res) => {
    const notificationId = req.params.id;  // Get notification ID from the request
    const pool = mysql.createPool({  // Ensure pool is used correctly
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    try {
        const [result] = await pool.promise().query('UPDATE admin_notifications SET is_read = 1 WHERE notification_id = ?', [notificationId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error marking notification as read.' });
    }
});

// Serve static files and set view engine
app.use(express.static(path.join(__dirname, 'frontend'))); // Serve static files
app.set('view engine', 'ejs'); // Set view engine to EJS
app.set('views', path.join(__dirname, 'views')); // Set your views directory

// Root route for testing API
app.get('/Home', (req, res) => {
    const endpoints = [
        { path: '/api/auth', description: 'Authentication routes for user login, registration, and management' },
        { path: '/api/admin', description: 'Admin routes for managing the system and users' },
        { path: '/api/teachers', description: 'Routes for teacher management' },
        { path: '/api/students', description: 'Routes for student management' },
        { path: '/api/notifications', description: 'Notification routes' },
        { path: '/api/attendance', description: 'Routes for attendance records' },
        { path: '/api/timetable', description: 'Routes for class timetables' },
        { path: '/api/assignments', description: 'Routes for assignments' },
        { path: '/api/submissions', description: 'Routes for assignment submissions' },
        { path: '/api/questions', description: 'Routes for question bank management' },
        { path: '/api/admin-notifications', description: 'Routes for admin notifications' },
        { path: '/api/class-materials', description: 'Routes for class materials' },
        { path: '/api/classes', description: 'Routes for class management' },
        { path: '/api/teacher-notifications', description: 'Routes for teacher notifications' },
    ];

    res.render('index', { endpoints });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Initialize MySQL database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database successfully');
    }
});

// Export the app for testing 
module.exports = app;

// Listen on the configured port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
