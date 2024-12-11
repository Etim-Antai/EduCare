const db = require('../config/db');

class ClassModel {
    async addClass(classData) {
        const { class_name, teacher_id, start_date, end_date, time_of_day } = classData;

        const [result] = await db.query(
            'INSERT INTO Classes (class_name, teacher_id, start_date, end_date, time_of_day) VALUES (?, ?, ?, ?, ?)',
            [class_name, teacher_id, start_date, end_date, time_of_day]
        );

        return result.insertId;
    }

    async updateClass(classId, classData) {
        await db.query(
            'UPDATE Classes SET class_name = ?, teacher_id = ?, start_date = ?, end_date = ?, time_of_day = ? WHERE class_id = ?',
            [classData.class_name, classData.teacher_id, classData.start_date, classData.end_date, classData.time_of_day, classId]
        );
    }

    async deleteClass(classId) {
        await db.query('DELETE FROM Classes WHERE class_id = ?', [classId]);
    }

    async getClasses() {
        const [classes] = await db.query('SELECT * FROM Classes');
        return classes;
    }
}

module.exports = new ClassModel();
