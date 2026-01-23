import { getQuizById } from "./items.service.js";
import { Question, QuizResult, QuizReviewItem } from "../types/index.js";

interface CustomError extends Error {
  status?: number;
}

const isIntegerAnswer = (value: any): value is number =>
  Number.isInteger(value);

const scoreAnswers = (questions: Question[], answers: number[]): QuizResult => {
  let correctCount = 0;
  const review: QuizReviewItem[] = questions.map((question, index) => {
    const choices = Array.isArray(question.choices) ? question.choices : [];
    const expected = question.correctIndex;
    const expectedValid =
      Number.isInteger(expected) && expected >= 0 && expected < choices.length;
    const actual = answers[index];
    const actualValid =
      isIntegerAnswer(actual) && actual >= 0 && actual < choices.length;
    const selectedIndex = actualValid ? actual : null;
    const correct = expectedValid && selectedIndex === expected;
    if (correct) {
      correctCount += 1;
    }
    return {
      correct,
      correctIndex: expectedValid ? expected : null,
      selectedIndex,
    };
  });
  const total = questions.length;
  const scorePercent =
    total === 0 ? 0 : Math.round((correctCount / total) * 100);
  return {
    scorePercent,
    correctCount,
    total,
    review,
  };
};

interface AttemptQuizParams {
  quizId: string;
  userId: string;
  answers: number[];
}

export const attemptQuiz = async ({
  quizId,
  userId,
  answers,
}: AttemptQuizParams): Promise<QuizResult> => {
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    const error: CustomError = new Error("Quiz not found");
    error.status = 404;
    throw error;
  }
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  if (!Array.isArray(answers) || !answers.every(isIntegerAnswer)) {
    const error: CustomError = new Error(
      "Answers must be an array of integers",
    );
    error.status = 400;
    throw error;
  }
  const result = scoreAnswers(questions, answers);
  return result;
};
