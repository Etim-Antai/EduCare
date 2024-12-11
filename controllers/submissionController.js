// controllers/submissionController.js
const Submission = require('../models/submissionModel');
const Question = require('../models/questionModel');
const { createAssignmentSubmissionNotification } = require('../utils/notificationUtils'); // Import the notification utility
const db = require('../config/db'); // Import the db connection

exports.submit = async (req, res) => {
    const { assignment_id, content, studentAnswers } = req.body; // Include student answers for grading
    const student_id = req.user.id; // Get the student ID from the authenticated JWT token

    // Validation
    if (!assignment_id || !content || typeof studentAnswers !== 'object') {
        return res.status(400).json({ error: 'assignment_id, content, and valid studentAnswers are required' });
    }

    try {
        // Create the submission record in the database
        const newSubmissionId = await Submission.createSubmission({
            assignment_id,
            student_id,
            content,
        });

        // Fetch questions related to the assignment
        const questions = await Question.getQuestionsByAssignment(assignment_id);
        if (!questions.length) {
            return res.status(404).json({ error: 'No questions found for this assignment.' });
        }

        let totalScore = 0;
        let gradedStatus = 0; // Default to not graded (0)

        // Compare submitted answers with the correct ones
        for (const question of questions) {
            const { question_id } = question;
            const { correct_answer, points } = await Question.getCorrectAnswer(question_id);

            // Log the comparison for debugging
            console.log(`Comparing student's answer: ${studentAnswers[question_id]} with correct answer: ${correct_answer}`);

            // Check if the student's answer is correct
            if (studentAnswers[question_id] !== undefined) {
                if (studentAnswers[question_id] === correct_answer) {
                    totalScore += points; // Increment score based on points associated with the question
                    gradedStatus = 1; // Set graded status to 1 for correct answer
                }
            }
        }

        // Update the total score and graded status in the submission
        await Submission.updateScore(newSubmissionId, totalScore, gradedStatus);

        // Update student answers
        await Submission.updateStudentAnswers(newSubmissionId, studentAnswers);

        // Log the submission notification for the student
        await createAssignmentSubmissionNotification(student_id, assignment_id); // Log the submission notification

        res.status(201).json({
            id: newSubmissionId,
            message: 'Submission created and graded successfully!',
            score: totalScore,
            graded: gradedStatus // Returns 1 or 0 depending on correctness
        });
    } catch (error) {
        console.error(`Error in submitting assignment: ${error.message}`);
        res.status(500).json({ error: `Submission error: ${error.message}` });
    }
};

// Note: Keep the existing automateGradeSubmission function if it stays unchanged
exports.automateGradeSubmission = async (req, res) => {
    const submission_id = req.params.id;
    const { userCode, studentAnswers } = req.body; // The code submitted by the user and student answers.

    // Validation
    if (!userCode || typeof studentAnswers !== 'object') {
        return res.status(400).json({ error: 'userCode and valid studentAnswers are required' });
    }

    try {
        // Fetch questions related to the assignment
        const questions = await Question.getQuestionsByAssignment(submission_id);
        let gradedStatus = 0; // Default graded to 0
        let totalScore = 0; // Total score to return

        for (const question of questions) {
            const { question_id, points } = question; // Get current question's points
            const { correct_answer } = await Question.getCorrectAnswer(question_id);

            // Log the comparison for debugging
            console.log(`Checking student answer for question ID ${question_id}: "${studentAnswers[question_id]}" against correct answer: "${correct_answer}"`);

            // Compare student answers to the correct answers
            if (studentAnswers[question_id] !== undefined) {
                if (studentAnswers[question_id].toString() === correct_answer.toString()) {
                    gradedStatus = 1; // Set graded to 1 for correct answer
                    totalScore += points; // Add to score based on question's points
                } else {
                    gradedStatus = 0; // Set graded to 0 if this answer is wrong
                }
            }
        }

        // Update the submission with the new score and graded status
        await Submission.updateScore(submission_id, totalScore, gradedStatus);

        res.status(200).json({
            message: 'Submission graded successfully!',
            totalScore,
            gradedStatus // Return graded status (1 or 0)
        });
        
    } catch (error) {
        console.error(`Error in automating grade submission: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};




exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.getAllSubmissions(); // Call the method to get all submissions
        res.status(200).json(submissions); // Send the submissions as JSON
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors and send appropriate response
    }
};