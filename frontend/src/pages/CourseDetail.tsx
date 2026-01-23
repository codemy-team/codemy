import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourse, getCourseItems } from "../services/api";
import type { Course, CourseItem } from "../types";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [items, setItems] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourse(courseId);
        setCourse(courseData);

        const itemsData = await getCourseItems(courseId);
        setItems(itemsData.items || []);
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!course) {
    return <div className="text-center py-20">Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-2">{course.instructor}</p>
      <p className="text-gray-500 text-sm mb-4">
        {course.category} · {course.level}
      </p>
      <p className="text-gray-700 mb-6">{course.description}</p>

      <h2 className="text-2xl font-bold mb-4">Course Content</h2>

      {items.length === 0 ? (
        <p className="text-gray-500">No content yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            // Determine if it's a flashcard (quiz with isFlashcard questions)
            const isFlashcard =
              item.type === "flashcard" ||
              (item.type === "quiz" &&
                item.questions?.some((q) => q.isFlashcard));

            // Get URL from storage object or direct url field
            const itemUrl = item.storage?.url || item.url;

            // Determine route and state based on item type
            let toPath, linkState, icon, typeLabel;

            if (item.type === "material") {
              // PDF Material - route to video player with PDF mode
              toPath = `/video/${item.itemId}`;
              linkState = { pdfUrl: itemUrl, title: item.title, isPdf: true };
              icon = "📄";
              typeLabel = "Material";
            } else if (isFlashcard) {
              // Flashcard - convert questions to flashcard format and route to flashcard page
              const flashcards =
                item.type === "flashcard"
                  ? item.flashcards
                  : item.questions?.map((q) => ({
                      front: q.prompt,
                      back: q.choices[0],
                    })) || [];
              toPath = `/flashcard/${item.itemId}`;
              linkState = { flashcards, title: item.title };
              icon = "📇";
              typeLabel = "Flashcard";
            } else if (item.type === "quiz") {
              // Regular Quiz
              toPath = `/quiz/${item.itemId}`;
              linkState = { quiz: item };
              icon = "🎯";
              typeLabel = "Quiz";
            } else {
              // Video
              toPath = `/video/${item.itemId}`;
              linkState = { videoUrl: itemUrl, title: item.title };
              icon = "▶";
              typeLabel = "Video";
            }

            return (
              <Link
                key={item.itemId}
                to={toPath}
                state={linkState}
                className="block p-4 bg-gray-100 rounded hover:bg-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-purple-600">{icon}</span>
                  <span>{item.title}</span>
                  <span className="text-gray-400 text-sm ml-auto">
                    {typeLabel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
