import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm">{course.instructor}</p>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;