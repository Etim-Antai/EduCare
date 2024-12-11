const db = require('../config/db');

class TimetableModel {
    async addTimetableEntry(timetableData) {
        const { class_id, teacher_id, day_of_week, start_time, end_time, location } = timetableData;

        // Validate required fields
        if (!class_id || !teacher_id || !day_of_week || !start_time || !end_time || !location) {
            throw new Error('Missing required fields: class_id, teacher_id, day_of_week, start_time, end_time, location');
        }

        // Validate day_of_week Enum
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!validDays.includes(day_of_week)) {
            throw new Error('Invalid value for day_of_week');
        }

        const [result] = await db.query(
            'INSERT INTO Timetable (class_id, teacher_id, day_of_week, start_time, end_time, location) VALUES (?, ?, ?, ?, ?, ?)',
            [class_id, teacher_id, day_of_week, start_time, end_time, location || null] // Default location to null if not provided
        );

        return result.insertId;
    }

    async deleteTimetableEntry(timetableId) {
        // Validate timetableId
        if (!timetableId) {
            throw new Error('Timetable ID is required');
        }

        await db.query('DELETE FROM Timetable WHERE timetable_id = ?', [timetableId]);
    }

    async getTimetable() {
        const [timetables] = await db.query('SELECT * FROM Timetable');
        return timetables;
    }

    async updateTimetableEntry(timetableId, timetableData) {
        const { class_id, teacher_id, day_of_week, start_time, end_time, location } = timetableData;

        // Validate required fields
        if (!class_id || !teacher_id || !day_of_week || !start_time || !end_time) {
            throw new Error('Missing required fields: class_id, teacher_id, day_of_week, start_time, end_time,location');
        }

        // Validate day_of_week Enum
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!validDays.includes(day_of_week)) {
            throw new Error('Invalid value for day_of_week');
        }

        const [result] = await db.query(
            'UPDATE Timetable SET class_id = ?, teacher_id = ?, day_of_week = ?, start_time = ?, end_time = ?, location = ? WHERE timetable_id = ?',
            [class_id, teacher_id, day_of_week, start_time, end_time, location || null, timetableId]
        );

        return result.affectedRows; // Returns the number of rows affected by the update
    }

    // Get timetable by ID
    async getTimetableById(timetableId) {
        if (!timetableId) {
            throw new Error('Timetable ID is required');
        }

        const [timetable] = await db.query('SELECT * FROM Timetable WHERE timetable_id = ?', [timetableId]);
        
        if (timetable.length === 0) {
            throw new Error('Timetable entry not found');
        }

        return timetable[0]; // Return the first entry
    }

    // Get timetable by class_id
    async getTimetableByClassId(class_id) {
        if (!class_id) {
            throw new Error('Class ID is required');
        }

        const [timetables] = await db.query('SELECT * FROM Timetable WHERE class_id = ?', [class_id]);
        
        if (timetables.length === 0) {
            throw new Error('No timetable entries found for the specified class ID');
        }

        return timetables; // Return the array of timetable entries
    }
}

module.exports = new TimetableModel();
