import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = location.state || {};

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || !quiz.questions) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline mb-6 block"
        >
          ← Back to Course
        </button>
        <p>Quiz not found</p>
      </div>
    );
  }

  const handleSelect = (questionIndex, choiceIndex) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionIndex]: choiceIndex,
    });
  };

  const handleSubmit = async () => {
    const answerArray = quiz.questions.map((_, index) => answers[index] ?? -1);

    try {
      const response = await fetch(
        `${API_BASE_URL}/quizzes/${quiz.itemId}/attempt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers: answerArray }),
        },
      );

      const data = await response.json();
      setResult(data);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:underline mb-6 block"
      >
        ← Back to Course
      </button>

      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      {result && (
        <div className="mb-6 p-4 bg-purple-100 rounded-lg">
          <p className="text-xl font-bold text-purple-700">
            Score: {result.scorePercent}% ({result.correctCount}/{result.total})
          </p>
        </div>
      )}

      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => {
          // Get question text - try prompt first, then question field
          const questionText = question.prompt || question.question || "";

          // Get correct index - handle string or number
          const rawCorrectIndex =
            question.correctIndex ?? question.correct_index ?? question.answer;
          const correctIdx =
            typeof rawCorrectIndex === "string"
              ? parseInt(rawCorrectIndex, 10)
              : rawCorrectIndex;
          const hasCorrect =
            typeof correctIdx === "number" &&
            !isNaN(correctIdx) &&
            correctIdx >= 0 &&
            correctIdx < question.choices.length;

          return (
            <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-3">
                {qIndex + 1}. {questionText || "Question not available"}
              </p>
              <div className="space-y-2">
                {question.choices.map((choice, cIndex) => {
                  const isCorrect = hasCorrect && correctIdx === cIndex;
                  const selected = answers[qIndex] === cIndex;

                  let btnClass =
                    "w-full text-left p-3 rounded border transition-colors ";

                  if (!submitted) {
                    btnClass += selected
                      ? "bg-purple-500 text-white border-purple-500"
                      : "bg-white hover:bg-gray-100 border-gray-200";
                  } else if (selected && isCorrect) {
                    btnClass += "bg-green-500 text-white border-green-500";
                  } else if (selected && !isCorrect) {
                    btnClass += "bg-red-500 text-white border-red-500";
                  } else {
                    btnClass += "bg-white border-gray-200";
                  }

                  return (
                    <button
                      key={cIndex}
                      onClick={() => handleSelect(qIndex, cIndex)}
                      disabled={submitted}
                      className={btnClass}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-3 text-sm text-gray-700">
                  {!hasCorrect
                    ? "Correct answer not available for this question."
                    : answers[qIndex] === correctIdx
                      ? "You answered correctly!"
                      : `Your answer: ${
                          typeof answers[qIndex] === "number" &&
                          answers[qIndex] >= 0
                            ? question.choices[answers[qIndex]]
                            : "No answer"
                        } · Correct: ${question.choices[correctIdx]}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
};

export default Quiz;
