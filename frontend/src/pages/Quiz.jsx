import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

const Quiz = () => {
  const location = useLocation();
  const { quiz } = location.state || {};
  
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || !quiz.questions) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-6">
        <Link to="/" className="text-blue-500 hover:underline mb-6 block">
          ← Back to Courses
        </Link>
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
      const response = await fetch(`${API_BASE_URL}/quizzes/${quiz.itemId}/attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: answerArray }),
      });

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
      <Link to="/" className="text-blue-500 hover:underline mb-6 block">
        ← Back to Courses
      </Link>

      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      {result && (
        <div className="mb-6 p-4 bg-purple-100 rounded-lg">
          <p className="text-xl font-bold text-purple-700">
            Score: {result.scorePercent}% ({result.correctCount}/{result.total})
          </p>
        </div>
      )}

      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-3">
              {qIndex + 1}. {question.prompt}
            </p>
            <div className="space-y-2">
              {question.choices.map((choice, cIndex) => (
                <button
                  key={cIndex}
                  onClick={() => handleSelect(qIndex, cIndex)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    answers[qIndex] === cIndex
                      ? "bg-purple-500 text-white border-purple-500"
                      : "bg-white hover:bg-gray-100 border-gray-200"
                  } ${
                    submitted && question.correctIndex === cIndex
                      ? "bg-green-500 text-white border-green-500"
                      : ""
                  } ${
                    submitted && answers[qIndex] === cIndex && question.correctIndex !== cIndex
                      ? "bg-red-500 text-white border-red-500"
                      : ""
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ))}
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