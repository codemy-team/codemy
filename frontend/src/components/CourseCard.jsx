import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course.courseId}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <img 
          src={course.thumbnailUrl || "https://via.placeholder.com/400x200?text=No+Image"} 
          alt={course.title}
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm">{course.instructor}</p>
          <p className="text-gray-500 text-xs mt-2">{course.category} · {course.level}</p>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;