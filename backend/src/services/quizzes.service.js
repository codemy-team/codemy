import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";
import { getQuizById } from "./items.service.js";

const scoreAnswers = (questions, answers) => {
    let correctCount = 0;
    questions.forEach((question, index) => {
        const expected = question.correctIndex;
        const actual = answers[index];
        if (actual === expected) {
            correctCount += 1;
        }
    });
    const total = questions.length;
    const scorePercent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    return {
        scorePercent,
        correctCount,
        total
    };
};

export const attemptQuiz = async ({ quizId, userId, answers }) => {
    const quiz = await getQuizById(quizId);
    if (!quiz) {
        const error = new Error("Quiz not found");
        error.status = 404;
        throw error;
    }
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    const result = scoreAnswers(questions, answers);
    const attempt = {
        userId,
        sk: `${quizId}#${Date.now()}`,
        quizId,
        courseId: quiz.courseId,
        scorePercent: result.scorePercent,
        correctCount: result.correctCount,
        total: result.total,
        createdAt: new Date().toISOString()
    };

    await docClient.send(
        new PutCommand({
            TableName: env.quizAttemptsTable,
            Item: attempt
        })
    );

    return result;
};
