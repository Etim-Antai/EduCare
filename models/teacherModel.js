const db = require('../config/db'); // Database connection setup
const bcrypt = require('bcrypt');

class TeacherModel {
    // Add a new teacher
    async addTeacher(teacherData) {
        const { first_name, last_name, subject, phone, email, password, hire_date } = teacherData;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO teachers (first_name, last_name, subject, phone, email, password, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, subject, phone, email, hashedPassword, hire_date]
        );

        return result.insertId; // Return the newly created teacher's ID
    }

    // Update teacher details
    async updateTeacher(teacherId, teacherData) {
        const { first_name, last_name, subject, phone, email, hire_date, password } = teacherData;
        const params = [first_name, last_name, subject, phone, email, hire_date, teacherId];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            params.unshift(hashedPassword); // Add the hashed password at the start
            const [result] = await db.query(
                'UPDATE teachers SET first_name = ?, last_name = ?, subject = ?, phone = ?, email = ?, password = ?, hire_date = ? WHERE teacher_id = ?',
                params
            );
            return result;
        } else {
            const [result] = await db.query(
                'UPDATE teachers SET first_name = ?, last_name = ?, subject = ?, phone = ?, email = ?, hire_date = ? WHERE teacher_id = ?',
                [...params.slice(0, -1), teacherId]
            );
            return result;
        }
    }

    // Soft delete a teacher
    async deleteTeacher(teacherId) {
        await db.query('UPDATE teachers SET deleted_at = NOW() WHERE teacher_id = ?', [teacherId]);
    }

    // Fetch all teachers
    async getTeachers(search = '') {
        let query = 'SELECT * FROM teachers WHERE deleted_at IS NULL';
        const params = [];
        
        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const [teachers] = await db.query(query, params);
        return teachers; // Return the list of teachers
    }

    // Fetch teacher by ID
    async getTeacherById(teacherId) {
        const [teacher] = await db.query('SELECT * FROM teachers WHERE teacher_id = ? AND deleted_at IS NULL', [teacherId]);
        return teacher[0] || null; // Return the teacher record or null if not found
    }

    // Check if a teacher exists by email
    async getTeacherByEmail(email) {
        const [teacher] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);
        return teacher[0] || null; // Return the teacher record or null if not found
    }

    // Fetch classes by teacher ID
    async getClassesByTeacherId(teacherId) {
        const [classes] = await db.query('SELECT * FROM classes WHERE teacher_id = ? AND deleted_at IS NULL', [teacherId]);
        return classes; // Return the list of classes
    }

    // Fetch all students
    async getAllStudents() {
        const [students] = await db.query('SELECT * FROM students WHERE deleted_at IS NULL');
        return students; // Return the list of students
    }

    // Add class material
    async addClassMaterial(materialData) {
        const { class_id, title, description, file_url, uploaded_by } = materialData;

        try {
            const [result] = await db.query(
                'INSERT INTO classmaterials (class_id, title, description, file_url, uploaded_by) VALUES (?, ?, ?, ?, ?)',
                [class_id, title, description, file_url, uploaded_by]
            );

            return result.insertId; // Return the ID of the newly created class material
        } catch (error) {
            console.error('Error adding class material:', error);
            throw error; // Propagate error for further handling in the controller
        }
    }

    // Fetch class materials uploaded by a specific teacher
    async getClassMaterialsByTeacherId(teacherId) {
        const [materials] = await db.query('SELECT * FROM classmaterials WHERE uploaded_by = ? AND deleted_at IS NULL', [teacherId]);
        return materials; // Return the list of class materials uploaded by the teacher
    }

    // Fetch class materials by class ID
    async getClassMaterialsByClassId(classId) {
        const [materials] = await db.query('SELECT * FROM classmaterials WHERE class_id = ? AND deleted_at IS NULL', [classId]);
        return materials; // Return the list of class materials for the specific class
    }
}

module.exports = new TeacherModel();
