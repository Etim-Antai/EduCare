const db = require('../config/db');

class GradeModel {
    async addGrade(gradeData) {
        const { student_id, class_id, term, score } = gradeData;

        const [result] = await db.query(
            'INSERT INTO Grades (student_id, class_id, term, score) VALUES (?, ?, ?, ?)',
            [student_id, class_id, term, score]
        );

        return result.insertId;
    }

    async updateGrade(gradeId, gradeData) {
        await db.query(
            'UPDATE Grades SET student_id = ?, class_id = ?, term = ?, score = ? WHERE grade_id = ?',
            [gradeData.student_id, gradeData.class_id, gradeData.term, gradeData.score, gradeId]
        );
    }

    async deleteGrade(gradeId) {
        await db.query('DELETE FROM Grades WHERE grade_id = ?', [gradeId]);
    }

    async getGrades() {
        const [grades] = await db.query('SELECT * FROM Grades');
        return grades;
    }
}

module.exports = new GradeModel();
