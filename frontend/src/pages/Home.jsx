import Hero from "../components/Hero";
import CourseCard from "../components/CourseCard";
import courses from "../data/courses";

const Home = () => {
  return (
    <div>
      <Hero />
      <div className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold mb-8">All Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;