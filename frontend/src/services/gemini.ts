const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("VITE_GROQ_API_KEY is not set in .env file");
}

export const generateQuiz = async (courseTitle, level, numQuestions = 5) => {
  const prompt = `Generate ${numQuestions} multiple choice quiz questions for a course titled "${courseTitle}" at ${level} level.

Return ONLY a valid JSON array with this exact format, no other text:
[
  {
    "prompt": "Question text here?",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "API request failed");
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse quiz response");

  return JSON.parse(jsonMatch[0]);
};

export const generateFlashcards = async (courseTitle, level, numCards = 10) => {
  const prompt = `Generate ${numCards} flashcards for a course titled "${courseTitle}" at ${level} level.

Return ONLY a valid JSON array with this exact format, no other text:
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  }
]`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "API request failed");
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse flashcard response");

  return JSON.parse(jsonMatch[0]);
};
