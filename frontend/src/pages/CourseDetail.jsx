import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourse, getCourseItems } from "../services/api";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <Link to="/" className="text-blue-500 hover:underline mb-6 block">
        ← Back to Courses
      </Link>

      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-2">{course.instructor}</p>
      <p className="text-gray-500 text-sm mb-4">{course.category} · {course.level}</p>
      <p className="text-gray-700 mb-6">{course.description}</p>

      <h2 className="text-2xl font-bold mb-4">Course Content</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500">No content yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.itemId}
              to={item.type === "quiz" ? `/quiz/${item.itemId}` : `/video/${item.itemId}`}
              state={item.type === "quiz" ? { quiz: item } : { videoUrl: item.url, title: item.title }}
              className="block p-4 bg-gray-100 rounded hover:bg-gray-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-600">▶</span>
                <span>{item.title}</span>
                <span className="text-gray-400 text-sm ml-auto">{item.type}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;