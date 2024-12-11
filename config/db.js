const mysql = require('mysql2');
// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Create a connection pool for efficient database queries
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to create tables based on your provided schema
async function createTables() {
    try {
        // Create admin_notifications table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS admin_notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                teacher_id INT NULL,
                student_id INT NULL,
                class_material_id INT NULL,
                attendance_id INT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_read TINYINT DEFAULT 0,
                registration_event TINYINT DEFAULT 0,
                assignment_submission_event TINYINT DEFAULT 0
            )
        `);

        // Create admins table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS admins (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NULL,
                last_name VARCHAR(50) NULL,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(15) NULL,
                role ENUM('Super Admin', 'Data Manager') NOT NULL,
                last_login DATETIME NULL
            )
        `);

        // Create assignments table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS assignments (
                assignment_id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NULL,
                due_date DATETIME NOT NULL,
                total_points DECIMAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create attendance table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                attendance_id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                date DATE NOT NULL,
                status ENUM('Present', 'Absent') NOT NULL
            )
        `);

        // Create classes table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS classes (
                class_id INT AUTO_INCREMENT PRIMARY KEY,
                class_name VARCHAR(100) NOT NULL,
                teacher_id INT NOT NULL,
                start_date DATE NULL,
                end_date DATE NULL,
                time_of_day VARCHAR(50) NULL
            )
        `);

        // Create classmaterials table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS classmaterials (
                material_id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NULL,
                file_url VARCHAR(255) NULL,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                uploaded_by INT NOT NULL,
                deleted_at DATETIME NULL
            )
        `);

        // Create grades table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS grades (
                grade_id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                term VARCHAR(50) NULL,
                score DECIMAL NULL
            )
        `);

        // Create notifications table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                message TEXT NOT NULL,
                material_id INT NULL,
                assignment_id INT NULL,
                notification_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_read TINYINT DEFAULT 0,
                title VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create questions table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS questions (
                question_id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                question_text TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                points DECIMAL NOT NULL DEFAULT 100.00
            )
        `);

        // Create students table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS students (
                student_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                gender ENUM('male', 'female', 'other') NULL,
                date_of_birth DATE NULL,
                address VARCHAR(255) NULL,
                contact_info VARCHAR(255) NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                enrollment_date DATE NOT NULL,
                class_id INT NULL,
                deleted_at DATETIME NULL
            )
        `);

        // Create submissions table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS submissions (
                submission_id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                content TEXT NOT NULL,
                submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                score FLOAT NULL,
                graded TINYINT DEFAULT 0,
                student_answers JSON NULL
            )
        `);

        // Create teacher_notifications table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS teacher_notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                teacher_id INT NOT NULL,
                message TEXT NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_status TINYINT DEFAULT 0
            )
        `);

        // Create teachers table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS teachers (
                teacher_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                subject VARCHAR(50) NULL,
                phone VARCHAR(15) NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                hire_date DATE NULL,
                deleted_at DATETIME NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'Teacher'
            )
        `);

        // Create timetable table
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS timetable (
                timetable_id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                teacher_id INT NOT NULL,
                day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                location VARCHAR(255) NULL
            )
        `);

        console.log('All tables created successfully.');

    } catch (err) {
        console.error('Error creating tables:', err.message); // Improved error handling
    }
}

// Call the function to create tables
createTables();

module.exports = pool.promise(); // Export the promise-based pool
