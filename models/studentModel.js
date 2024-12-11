const db = require('../config/db');
const bcrypt = require('bcrypt');

class StudentModel {
    // Add a new student
    async addStudent(studentData) {
        const { first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id } = studentData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO Students (first_name, last_name, gender, date_of_birth, address, contact_info, email, password, enrollment_date, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, gender, date_of_birth, address, contact_info, email, hashedPassword, enrollment_date, class_id]
        );

        return result.insertId;
    }

    // Update student details
    async updateStudent(studentId, studentData) {
        const { first_name, last_name, gender, date_of_birth, address, contact_info, email, enrollment_date, class_id, password } = studentData;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            studentData.password = hashedPassword; // Set hashed password
        }

        await db.query(
            'UPDATE Students SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?, address = ?, contact_info = ?, email = ?, password = ?, enrollment_date = ?, class_id = ? WHERE student_id = ?',
            [first_name, last_name, gender, date_of_birth, address, contact_info, email, studentData.password, enrollment_date, class_id, studentId]
        );
    }

    // Delete a student (soft delete)
    async deleteStudent(studentId) {
        await db.query('UPDATE Students SET deleted_at = NOW() WHERE student_id = ?', [studentId]);
    }

    // Fetch all students with optional filters
    async getStudents(search = '', class_id = null) {
        let query = 'SELECT * FROM Students WHERE deleted_at IS NULL';
        const params = [];

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (class_id) {
            query += ' AND class_id = ?';
            params.push(class_id);
        }

        const [students] = await db.query(query, params);
        return students;
    }

    // Fetch a student by ID
    async getStudentById(studentId) {
        const [student] = await db.query('SELECT * FROM Students WHERE student_id = ? AND deleted_at IS NULL', [studentId]);
        return student[0] || null; // Return student or null
    }
}

// Export the instance of StudentModel
module.exports = new StudentModel();
