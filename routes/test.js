describe teacher_notifications
notification_id	int	NO	PRI		auto_increment
teacher_id	int	NO	MUL		
message	text	NO			
event_type	varchar(50)	NO			
created_at	datetime	YES		CURRENT_TIMESTAMP	DEFAULT_GENERATED
read_status	tinyint(1)	YES		0	


// teacherNotificationUtils.js
const db = require('../config/db'); // Database connection setup

class TeacherNotificationUtils {
    /**
     * Create a new notification for a teacher
     * @param {Object} notificationData - The data for the notification
     * @param {number} notificationData.teacher_id - The ID of the teacher
     * @param {string} notificationData.message - The notification message
     * @param {string} notificationData.event_type - The type of event (e.g., "Student Login", "Submission", "Timetable Update")
     */
    static async createNotification({ teacher_id, message, event_type }) {
        try {
            const [result] = await db.query(
                'INSERT INTO teacher_notifications (teacher_id, message, event_type) VALUES (?, ?, ?)',
                [teacher_id, message, event_type]
            );
            return result.insertId; // Return the ID of the created notification
        } catch (error) {
            console.error('Error creating teacher notification:', error.message);
            throw new Error('Could not create teacher notification');
        }
    }

    /**
     * Fetch all notifications for a teacher
     * @param {number} teacher_id - The ID of the teacher
     * @param {boolean} unreadOnly - If true, fetch only unread notifications
     */
    static async fetchNotifications(teacher_id, unreadOnly = false) {
        try {
            let query = 'SELECT * FROM teacher_notifications WHERE teacher_id = ?';
            const params = [teacher_id];

            if (unreadOnly) {
                query += ' AND read_status = 0';
            }

            query += ' ORDER BY created_at DESC';

            const [notifications] = await db.query(query, params);
            return notifications;
        } catch (error) {
            console.error('Error fetching teacher notifications:', error.message);
            throw new Error('Could not fetch teacher notifications');
        }
    }

    /**
     * Mark a notification as read
     * @param {number} notification_id - The ID of the notification to mark as read
     */
    static async markAsRead(notification_id) {
        try {
            await db.query(
                'UPDATE teacher_notifications SET read_status = 1 WHERE notification_id = ?',
                [notification_id]
            );
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error.message);
            throw new Error('Could not mark notification as read');
        }
    }

    /**
     * Delete a notification
     * @param {number} notification_id - The ID of the notification to delete
     */
    static async deleteNotification(notification_id) {
        try {
            await db.query('DELETE FROM teacher_notifications WHERE notification_id = ?', [notification_id]);
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error.message);
            throw new Error('Could not delete notification');
        }
    }

    /**
     * Create a notification for a student login
     * @param {number} teacher_id - The ID of the teacher to notify
     * @param {string} studentName - The name of the student who logged in
     */
    static async notifyStudentLogin(teacher_id, studentName) {
        const message = `Student ${studentName} has logged in to the system.`;
        await this.createNotification({
            teacher_id,
            message,
            event_type: 'Student Login',
        });
    }

    /**
     * Create a notification for a student submission
     * @param {number} teacher_id - The ID of the teacher to notify
     * @param {string} assignmentTitle - The title of the submitted assignment
     * @param {string} studentName - The name of the student who submitted
     */
    static async notifyStudentSubmission(teacher_id, assignmentTitle, studentName) {
        const message = `Student ${studentName} submitted assignment: ${assignmentTitle}.`;
        await this.createNotification({
            teacher_id,
            message,
            event_type: 'Student Submission',
        });
    }

    /**
     * Create a notification for timetable update
     * @param {number} teacher_id - The ID of the teacher to notify
     * @param {string} adminName - The name of the admin who updated the timetable
     */
    static async notifyTimetableUpdate(teacher_id, adminName) {
        const message = `Admin ${adminName} has updated the timetable. Please check the schedule.`;
        await this.createNotification({
            teacher_id,
            message,
            event_type: 'Timetable Update',
        });
    }
}

module.exports = TeacherNotificationUtils;

// teacherNotificationModel.js
const db = require('../config/db'); // Adjust the path to your actual DB config

class TeacherNotification {
    // Create a new notification
    static async create(notificationData) {
        try {
            const result = await db.query(
                'INSERT INTO teacher_notifications (teacher_id, message, event_type, read_status) VALUES (?, ?, ?, ?)',
                [
                    notificationData.teacher_id, 
                    notificationData.message, 
                    notificationData.event_type,
                    notificationData.read_status || 0 // Default to unread if not specified
                ]
            );
            return result.insertId; // Return the ID of the new notification
        } catch (error) {
            throw error; // Handle error appropriately in your application
        }
    }

    // Get notifications for a specific teacher
    static async getNotificationsByTeacher(teacherId) {
        try {
            const [notifications] = await db.query(
                'SELECT * FROM teacher_notifications WHERE teacher_id = ? ORDER BY created_at DESC',
                [teacherId]
            );
            return notifications; // Return the list of notifications
        } catch (error) {
            throw error; // Handle error appropriately in your application
        }
    }

    // Get all notifications (if needed)
    static async getAllNotifications() {
        try {
            const [notifications] = await db.query(
                'SELECT * FROM teacher_notifications ORDER BY created_at DESC'
            );
            return notifications; // Return the list of all notifications
        } catch (error) {
            throw error; // Handle error appropriately in your application
        }
    }

    // Mark a notification as read
    static async markAsRead(notificationId) {
        try {
            await db.query(
                'UPDATE teacher_notifications SET read_status = 1 WHERE notification_id = ?',
                [notificationId]
            );
        } catch (error) {
            throw error; // Handle error appropriately in your application
        }
    }

    // Optional: Get counts of read/unread notifications for a teacher
    static async getNotificationCounts(teacherId) {
        try {
            const [results] = await db.query(`
                SELECT 
                    SUM(CASE WHEN read_status = 1 THEN 1 ELSE 0 END) AS readCount,
                    SUM(CASE WHEN read_status = 0 THEN 1 ELSE 0 END) AS unreadCount
                FROM teacher_notifications
                WHERE teacher_id = ?;
            `, [teacherId]);
            return results[0]; // Return the counts
        } catch (error) {
            throw error; // Handle error appropriately in your application
        }
    }
}

module.exports = TeacherNotification;

// teacherNotificationController.js
const TeacherNotification = require('../models/teacherNotificationModel'); // Ensure this path is correct

// Create notification
exports.createNotification = async (req, res) => {
    const { teacher_id, message, event_type } = req.body;

    // Validate required fields
    if (!teacher_id || !message || !event_type) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newNotificationId = await TeacherNotification.create({
            teacher_id,
            message,
            event_type,
            read_status: 0 // Default to unread
        });
        res.status(201).json({ message: 'Notification created successfully!', notification_id: newNotificationId });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: error.message });
    }
};

// Notify teacher when a class is created
exports.notifyTeacherOnClassCreation = async (teacherId, className) => {
    const message = `A new class "${className}" has been created.`;
    const event_type = 'class_creation';
    await TeacherNotification.create({
        teacher_id: teacherId,
        message,
        event_type,
        read_status: 0
    }).catch(error => console.error('Error notifying teacher:', error));
};

// Notify teacher when a timetable is created
exports.notifyTeacherOnTimetableCreation = async (teacherId, timetableName) => {
    const message = `A new timetable "${timetableName}" has been created.`;
    const event_type = 'timetable_creation';
    await TeacherNotification.create({
        teacher_id: teacherId,
        message,
        event_type,
        read_status: 0
    }).catch(error => console.error('Error notifying teacher:', error));
};

// Notify students on submission
exports.notifyStudentsOnSubmission = async (studentIds, assignmentTitle) => {
    for (const studentId of studentIds) {
        const message = `Your submission for "${assignmentTitle}" has been received.`;
        const event_type = 'submission_received';
        await TeacherNotification.create({
            teacher_id: studentId, // Assuming this is replaced by student_id for notifications
            message,
            event_type,
            read_status: 0
        }).catch(error => console.error('Error notifying student:', error));
    }
};

// Fetch notifications based on teacher ID
exports.getNotifications = async (req, res) => {
    const teacherId = req.user.id; // Assuming teacher ID is stored in the request user after authentication

    try {
        const notifications = await TeacherNotification.getNotificationsByTeacher(teacherId);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    const notificationId = req.params.id;

    try {
        await TeacherNotification.markAsRead(notificationId);
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
};

// Fetch all notifications (if you intend to have a route for this)
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await TeacherNotification.getAllNotifications();
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

//teacherNotificationRoutes.js
const express = require('express');
const router = express.Router();
const teacherNotificationController = require('../controllers/teacherNotificationController');
const { protect } = require('../middleware/authMiddleware'); // Import your auth middleware

// Route to create a new notification
router.post('/', protect, teacherNotificationController.createNotification);

// Route to get notifications for the authenticated teacher
router.get('/', protect, teacherNotificationController.getNotifications);

// Route to mark a notification as read
router.patch('/:id/read', protect, teacherNotificationController.markNotificationAsRead);

// Optional: Route to get all notifications (for admin or for teacher overview, if needed)
router.get('/all', protect, teacherNotificationController.getAllNotifications);

module.exports = router;

// teacherdashboard.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        header {
            background-color: #34495e;
            color: white;
            text-align: center;
            padding: 20px 0;
        }

        nav {
            margin: 10px 0;
            background-color: #2c3e50;
            text-align: center;
        }

        nav a {
            color: white;
            margin: 0 15px;
            text-decoration: none;
            padding: 10px 15px;
            transition: background-color 0.3s;
        }

        nav a:hover {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 5px;
        }

        .container {
            display: flex;
            flex: 1;
            margin: 20px;
            flex-wrap: nowrap; /* Prevent wrapping */
        }

        .sidebar {
            width: 120px;
            background-color: #7f8c8d;
            padding: 10px;
            border-radius: 5px;
            margin-right: 10px;
        }

        .sidebar h3 {
            color: white;
            font-size: 16px;
            text-align: center;
        }

        .sidebar a {
            display: block;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }

        .sidebar a:hover {
            background-color: rgba(255, 255, 255, 0.4);
        }

        .main-content {
            flex: 1; 
            padding: 20px;
            background: white;
            border-radius: 5px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            margin: 0 10px;
        }

        .stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .stat-item {
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #ecf0f1;
            margin: 5px; 
            flex-grow: 1; 
            padding: 15px;
            position: relative; /* Allow positioning for icon */
        }

        .stat-item i {
            position: absolute;
            left: 15px;
            top: 15px;
            font-size: 24px;
            color: #34495e;
        }

        footer {
            text-align: center;
            padding: 10px;
            background-color: #34495e;
            color: white;
        }

        .link {
            display: block;
            margin-top: 10px;
            color: #34495e;
        }

        .link:hover {
            text-decoration: underline;
        }

        #loading {
            display: none; 
            color: #007bff;
            font-weight: bold;
            margin-top: 10px;
        }

        .notification-sidebar {
            width: 200px; /* Adjusted width */
            background-color: #95a5a6;
            padding: 10px;
            border-radius: 5px;
            margin-left: 10px;
        }

        .notification-sidebar h3 {
            color: white;
            font-size: 16px;
            text-align: center;
        }

        .notification-sidebar ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
            color: white;
        }

        .notification-sidebar a {
            color: white;
            text-decoration: none;
        }

        .notification-sidebar a:hover {
            text-decoration: underline;
        }

        /* Media Queries for responsiveness */
        @media (max-width: 768px) {
            .sidebar {
                width: 80px; /* Reduced width for mobile */
            }

            .notification-sidebar {
                width: 150px; /* Reduced width for mobile */
            }

            .stat-item {
                font-size: 0.8em; /* Adjust font size for mobile */
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Teacher Dashboard</h1>
        <h2 id="teacherName"></h2>
    </header>

    <nav>
        <a href="teacherProfile.html">Profile</a>
        <a href="viewClasses.html">My Classes</a>
        <a href="teacherviewstudents.html">My Students</a>
        <a href="gradeAssignments.html">Grade Assignments</a>
        <a href="markAttendance.html">Manage Attendance</a>
        <a href="teachernotification.html">Notifications</a>
        <a href="viewSubmissions.html">View Submissions</a>
        <a href="teacherlogin.html">Logout</a>
    </nav>

    <div class="container">
        <div class="sidebar">
            <h3>Quick Actions</h3>
            <a href="createAssignment.html"><i class="fas fa-pencil-alt"></i> Create Assignment</a>
            <a href="viewTimetable.html"><i class="fas fa-calendar-alt"></i> View Timetable</a>
            <a href="messageStudents.html"><i class="fas fa-comments"></i> Message Students</a>
            <a href="viewResults.html"><i class="fas fa-bar-chart"></i> View Results</a>
            <a href="studentAttendance.html"><i class="fas fa-check-square"></i> View Attendance</a>
            <a href="createQuestions.html"><i class="fas fa-question"></i> Create Assignment Questions</a>
            <a href="viewQuestions.html"><i class="fas fa-question-circle"></i> View Questions</a>
            <a href="viewGrades.html"><i class="fas fa-file-alt"></i> View Grades</a>
            <a href="createClassMaterial.html"><i class="fas fa-folder"></i> Create Class Materials</a>
            <a href="viewClassMaterials.html"><i class="fas fa-folder-open"></i> View Class Materials</a>
        </div>

        <div class="main-content">
            <div id="loading">Loading statistics...</div> 
            <div class="stats">
                <div class="stat-item">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>My Classes</h3>
                    <p id="class-count">0</p>
                </div>
                <div class="stat-item">
                    <i class="fas fa-user-graduate"></i>
                    <h3>My Students</h3>
                    <p id="student-count">0</p>
                </div>
                <div class="stat-item">
                    <i class="fas fa-clipboard-check"></i>
                    <h3>Graded Assignments</h3>
                    <p id="assignment-count">0</p>
                </div>
            </div>
            <h2>Statistics Overview</h2>
            <canvas id="statisticsChart"></canvas>
        </div>

        <div class="notification-sidebar">
            <h3>Notifications</h3>
            <ul id="notificationList">
                <li><a href="#">Loading notifications...</a></li>
            </ul>
        </div>
    </div>

    <footer>
        <p>&copy; 2023 All Rights Reserved.</p>
        <p>Contact Us: support@teacher-dashboard.com | Phone: (123) 456-7890</p>
    </footer>

    <script>
        window.onload = function() {
            const firstName = localStorage.getItem('teacherFirstName');
            const lastName = localStorage.getItem('teacherLastName');
            document.getElementById('teacherName').innerText = `Welcome, ${firstName} ${lastName}!`;
            loadStatistics();
            loadNotifications();
        };

        async function loadStatistics() {
            document.getElementById('loading').style.display = 'block'; // Show loading indicator
            try {
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:9000/api/teacher/statistics', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                document.getElementById('class-count').innerText = data.classes || 0;
                document.getElementById('student-count').innerText = data.students || 0;
                document.getElementById('assignment-count').innerText = data.assignments || 0;
                loadStatisticsChart(data);
            } catch (error) {
                console.error('Error loading statistics:', error);
                alert("Failed to load statistics. Please try again later.");
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        }

        async function loadNotifications() {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('http://localhost:9000/api/teacher-notifications', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch notifications');
                }

                const data = await response.json();
                const notifications = data.notifications || []; // Ensure it's accessing the notifications array
                const notificationList = document.getElementById('notificationList');
                notificationList.innerHTML = ''; // Clear the existing loading message

                if (notifications.length === 0) {
                    notificationList.innerHTML = '<li><a href="#">No new notifications</a></li>';
                } else {
                    notifications.forEach(notification => {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                            <a href="#">${notification.message}</a>
                            <small>Type: ${notification.type}</small>
                            <small>Created At: ${new Date(notification.created_at).toLocaleString()}</small>`;
                        listItem.onclick = async () => {
                            await markAsRead(notification.notification_id);
                        };
                        notificationList.appendChild(listItem);
                    });
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
                alert("Failed to load notifications. Please try again later.");
            }
        }

        async function markAsRead(notificationId) {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`http://localhost:9000/api/teacher-notifications/${notificationId}/read`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to mark notification as read');
                }

                loadNotifications(); // Refresh the notifications list after marking as read
            } catch (error) {
                console.error('Error marking notification as read:', error);
                alert("Failed to mark notification as read. Please try again later.");
            }
        }

        function loadStatisticsChart(data) {
            const ctx = document.getElementById('statisticsChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Classes', 'Students', 'Assignments'],
                    datasets: [{
                        label: 'Counts',
                        data: [data.classes || 0, data.students || 0, data.assignments || 0],
                        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    </script>
</body>
</html>
