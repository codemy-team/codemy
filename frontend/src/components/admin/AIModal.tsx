// AI Generation Modal Component
import type { Course, QuizQuestion, FlashCard, AIType } from "../../types";

interface AIModalProps {
  selectedCourse: Course;
  aiType: AIType;
  aiGenerating: boolean;
  generatedContent: QuizQuestion[] | FlashCard[] | null;
  onClose: () => void;
  onTypeChange: (type: AIType) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  onSave: () => void;
}

const AIModal = ({
  selectedCourse,
  aiType,
  aiGenerating,
  generatedContent,
  onClose,
  onTypeChange,
  onGenerate,
  onRegenerate,
  onSave,
}: AIModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          AI Content Generator
        </h3>
        <p className="text-gray-500 mb-6">
          Generate content for "{selectedCourse.title}"
        </p>

        {/* Type Selection */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => onTypeChange("quiz")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              aiType === "quiz"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            🎯 Quiz
          </button>
          <button
            onClick={() => onTypeChange("flashcard")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              aiType === "flashcard"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            📇 Flashcards
          </button>
        </div>

        {/* Generate Button */}
        {!generatedContent && (
          <button
            onClick={onGenerate}
            disabled={aiGenerating}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {aiGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating with AI...
              </span>
            ) : (
              `✨ Generate ${aiType === "quiz" ? "Quiz" : "Flashcards"}`
            )}
          </button>
        )}

        {/* Preview Generated Content */}
        {generatedContent && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-4">Preview:</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {aiType === "quiz"
                ? (generatedContent as QuizQuestion[]).map((q, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-800 mb-2">
                        {i + 1}. {q.prompt}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.choices.map((c, j) => (
                          <div
                            key={j}
                            className={`text-sm p-2 rounded ${
                              j === q.correctIndex
                                ? "bg-green-100 text-green-700"
                                : "bg-white"
                            }`}
                          >
                            {c} {j === q.correctIndex && "✓"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                : (generatedContent as FlashCard[]).map((card, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-800">
                        Front: {card.front}
                      </p>
                      <p className="text-gray-600 mt-1">Back: {card.back}</p>
                    </div>
                  ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onRegenerate}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Regenerate
              </button>
              <button
                onClick={onSave}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Save to Course
              </button>
            </div>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIModal;
