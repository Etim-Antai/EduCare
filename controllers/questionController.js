const Question = require('../models/questionModel');

exports.createQuestion = async (req, res) => {
    const { assignment_id, question_text, correct_answer, points } = req.body;

    // Basic validation
    if (!assignment_id || !question_text || !correct_answer || points === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newQuestionId = await Question.createQuestion({ 
            assignment_id, 
            question_text, 
            correct_answer, 
            points 
        });
        res.status(201).json({ message: 'Question created successfully!', question_id: newQuestionId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQuestionsByAssignment = async (req, res) => {
    const assignment_id = req.params.assignment_id;

    try {
        const questions = await Question.getQuestionsByAssignment(assignment_id);
        // Check if questions exist
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this assignment' });
        }
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQuestionById = async (req, res) => {
    const id = req.params.id;

    try {
        const question = await Question.getCorrectAnswer(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
