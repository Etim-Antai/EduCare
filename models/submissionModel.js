// models/submissionModel.js
const db = require('../config/db'); // Database connection configuration
const fs = require('fs'); // File system module for file operations
const path = require('path'); // Module for handling file and directory paths
const { exec } = require('child_process'); // Module to execute shell commands

class Submission {
    static async createSubmission({ assignment_id, student_id, content }) {
        try {
            const [result] = await db.query(
                'INSERT INTO submissions (assignment_id, student_id, content, graded, score) VALUES (?, ?, ?, FALSE, NULL)',
                [assignment_id, student_id, content]
            );
            return result.insertId; // Return new submission ID
        } catch (error) {
            throw new Error(`Failed to create submission: ${error.message}`);
        }
    }

    static async updateScore(submission_id, score, gradedStatus = true) {
        try {
            const [result] = await db.query(
                'UPDATE submissions SET score = ?, graded = ? WHERE submission_id = ?',
                [score, gradedStatus, submission_id]
            );
            return result.affectedRows; // Number of rows affected
        } catch (error) {
            throw new Error(`Failed to update score: ${error.message}`);
        }
    }

    static async updateStudentAnswers(submission_id, studentAnswers) {
        try {
            await db.query(
                'UPDATE submissions SET student_answers = ? WHERE submission_id = ?',
                [JSON.stringify(studentAnswers), submission_id]
            );
        } catch (error) {
            throw new Error(`Failed to update student answers: ${error.message}`);
        }
    }

    // Fetch all submissions
    static async getAllSubmissions() {
        try {
            const [submissions] = await db.query('SELECT * FROM submissions');
            return submissions; // Return the list of submissions
        } catch (error) {
            throw new Error(`Failed to retrieve submissions: ${error.message}`);
        }
    }

    // Automated grading function
    static async automateGrading(submission_id, userCode, studentAnswers) {
        return new Promise((resolve, reject) => {
            const studentCodeFilePath = path.join(__dirname, 'studentCode.js');
            const testCasesFilePath = path.join(__dirname, 'testCases.json');

            // Writing user code to a file
            fs.writeFile(studentCodeFilePath, userCode, (writeError) => {
                if (writeError) {
                    return reject(`Error writing user code to file: ${writeError.message}`);
                }

                const testCases = [
                    { input: '', expected: 'Expected Output', points: 100 } // Modify as needed
                ];

                fs.writeFile(testCasesFilePath, JSON.stringify(testCases), (testCaseError) => {
                    if (testCaseError) {
                        return reject(`Error writing test cases: ${testCaseError.message}`);
                    }

                    exec(`node ${studentCodeFilePath}`, { timeout: 5000 }, async (execError, stdout, stderr) => {
                        if (execError) {
                            return reject(`Execution Error: ${stderr}`);
                        }

                        try {
                            const score = this.evaluateOutput(stdout, testCases);
                            await this.updateScore(submission_id, score); // Ensure this is updating the score
                            await this.updateStudentAnswers(submission_id, studentAnswers);

                            resolve(score); // Resolve with the calculated score
                        } catch (evaluationError) {
                            reject(`Error evaluating output: ${evaluationError.message}`);
                        }
                    });
                });
            });
        });
    }

    static evaluateOutput(output, testCases) {
        let totalScore = 0;

        testCases.forEach((testCase) => {
            if (output.includes(testCase.expected)) {
                totalScore += testCase.points || 100; // Default to 100 points if not specified
            }
        });

        return totalScore; // Return total aggregated score
    }
}

module.exports = Submission; // Export the Submission class for use in other files


/*
{
    "assignment_id": 1,
    "content": "This is my answer to the assignment regarding the capital of France.",
    "studentAnswers": {
        "3": "Pars" // Assuming the question ID for this question is 1
    }
}
*/
