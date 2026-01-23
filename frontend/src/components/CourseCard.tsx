import { Link } from "react-router-dom";
import type { Course } from "../types";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link to={`/course/${course.courseId}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-72 flex flex-col">
        {/* Fixed height image area */}
        <div className="h-40 bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Fixed height content area */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">
            {course.title}
          </h3>
          <div className="mt-auto">
            <p className="text-gray-600 text-sm">
              {course.instructor || "Unknown Instructor"}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {course.category || "General"} · {course.level || "All Levels"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
