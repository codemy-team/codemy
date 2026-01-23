import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const Flashcard = () => {
  const location = useLocation();
  const { flashcards, title } = location.state || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-6">
        <Link to="/" className="text-blue-500 hover:underline mb-6 block">
          ← Back to Courses
        </Link>
        <p>No flashcards found</p>
      </div>
    );
  }

  const card = flashcards[currentIndex];

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <Link to="/" className="text-blue-500 hover:underline mb-6 block">
        ← Back to Courses
      </Link>

      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-8">
        Card {currentIndex + 1} of {flashcards.length}
      </p>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-64 cursor-pointer perspective-1000"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div
            className={`absolute w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-xl flex items-center justify-center p-8 backface-hidden ${
              flipped ? "invisible" : ""
            }`}
          >
            <p className="text-white text-xl text-center font-medium">
              {card.front}
            </p>
          </div>
          {/* Back */}
          <div
            className={`absolute w-full h-full bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl flex items-center justify-center p-8 backface-hidden rotate-y-180 ${
              !flipped ? "invisible" : ""
            }`}
          >
            <p className="text-white text-xl text-center font-medium">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 mt-4 text-sm">
        Click card to flip
      </p>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={prevCard}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-all"
        >
          ← Previous
        </button>
        <button
          onClick={nextCard}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all"
        >
          Next →
        </button>
      </div>

      {/* Progress */}
      <div className="mt-8">
        <div className="flex gap-1 justify-center">
          {flashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setFlipped(false);
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-purple-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
