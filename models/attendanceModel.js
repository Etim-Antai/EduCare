const db = require('../config/db');

class AttendanceModel {
    async createAttendance(attendanceData) {
        const { student_id, class_id, date, status } = attendanceData;

        // Validate that all required fields are present
        if (!student_id || !class_id || !date || !status) {
            throw new Error('Missing required fields');
        }

        const [result] = await db.query(
            'INSERT INTO Attendance (student_id, class_id, date, status) VALUES (?, ?, ?, ?)',
            [student_id, class_id, date, status]
        );

        return result.insertId;
    }

    async updateAttendance(attendanceId, attendanceData) {
        // Validate attendanceId
        if (!attendanceId) {
            throw new Error('Attendance ID is required');
        }

        // Prepare fields for update
        const fields = [];
        const values = [];

        if (attendanceData.student_id) {
            fields.push('student_id = ?');
            values.push(attendanceData.student_id);
        }
        if (attendanceData.class_id) {
            fields.push('class_id = ?');
            values.push(attendanceData.class_id);
        }
        if (attendanceData.date) {
            fields.push('date = ?');
            values.push(attendanceData.date);
        }
        if (attendanceData.status) {
            fields.push('status = ?');
            values.push(attendanceData.status);
        }

        // Ensure there is at least one field to update
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        // Add attendanceId to values
        values.push(attendanceId);
        const sql = `UPDATE Attendance SET ${fields.join(', ')} WHERE attendance_id = ?`;
        
        await db.query(sql, values);
    }

    async deleteAttendance(attendanceId) {
        // Validate attendanceId
        if (!attendanceId) {
            throw new Error('Attendance ID is required');
        }
        
        await db.query('DELETE FROM Attendance WHERE attendance_id = ?', [attendanceId]);
    }

    async getAttendance() {
        const [attendanceRecords] = await db.query('SELECT * FROM Attendance');
        return attendanceRecords;
    }

    async getAttendanceByStudentId(student_id) {
        if (!student_id) {
            throw new Error('Student ID is required');
        }

        const [attendanceRecords] = await db.query('SELECT * FROM Attendance WHERE student_id = ?', [student_id]);
        
        if (attendanceRecords.length === 0) {
            throw new Error('No attendance records found for this student');
        }

        return attendanceRecords;
    }

    async getAttendanceByClassId(class_id) {
        if (!class_id) {
            throw new Error('Class ID is required');
        }

        const [attendanceRecords] = await db.query('SELECT * FROM Attendance WHERE class_id = ?', [class_id]);
        
        if (attendanceRecords.length === 0) {
            throw new Error('No attendance records found for this class');
        }

        return attendanceRecords;
    }
}

module.exports = new AttendanceModel();
