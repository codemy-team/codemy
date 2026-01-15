import { useParams, Link } from "react-router-dom";
import courses from "../data/courses";

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return <div className="p-6">Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-2">{course.instructor}</p>
      <p className="text-gray-700 mb-6">{course.description}</p>
      
      {course.website && (
        <a 
          href={course.website}
          target="_blank"
          className="text-blue-500 hover:underline mb-6 block"
        >
          Visit Official Website →
        </a>
      )}

      <h2 className="text-2xl font-bold mb-4">Videos</h2>
      <div className="space-y-3">
        {course.videos.map((video) => (
          <Link 
            key={video.id}
            to={`/video/${video.youtubeId}`}
            className="block p-4 bg-gray-100 rounded hover:bg-gray-200"
          >
            {video.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;