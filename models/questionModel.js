// questionModel.js

const db = require('../config/db');

class Question {
    static async createQuestion({ assignment_id, question_text, correct_answer, points }) {
        const [result] = await db.query(
            'INSERT INTO questions (assignment_id, question_text, correct_answer, points) VALUES (?, ?, ?, ?)',
            [assignment_id, question_text, correct_answer, points]
        );
        return result.insertId;
    }

    static async getCorrectAnswer(question_id) {
        const [result] = await db.query(
            'SELECT correct_answer, points FROM questions WHERE question_id = ?',
            [question_id]
        );
        return result[0];
    }

    static async getQuestionsByAssignment(assignment_id) {
        const [questions] = await db.query(
            'SELECT question_id, question_text FROM questions WHERE assignment_id = ?',
            [assignment_id]
        );
        return questions; // Return an array of questions
    }
}

module.exports = Question;
