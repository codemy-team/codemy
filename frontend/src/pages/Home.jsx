import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import CourseCard from "../components/CourseCard";
import { getCourses } from "../services/api";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div>
      <Hero />
      <div className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold mb-8">All Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;