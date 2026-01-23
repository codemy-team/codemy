// Trash Section Component
import type { Course } from "../../types";

interface TrashSectionProps {
  deletedCourses: Course[];
  onRestore: (courseId: string) => void;
  onDeletePermanently: (courseId: string) => void;
}

const TrashSection = ({
  deletedCourses,
  onRestore,
  onDeletePermanently,
}: TrashSectionProps) => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200/50 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Trash</h2>
      <div className="space-y-3">
        {deletedCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Trash is empty</p>
          </div>
        ) : (
          deletedCourses.map((course) => (
            <div
              key={course.courseId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{course.title}</h3>
                <p className="text-sm text-gray-500">
                  Deleted:{" "}
                  {course.deletedAt
                    ? new Date(course.deletedAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRestore(course.courseId)}
                  className="px-3 py-1.5 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium"
                >
                  Restore
                </button>
                <button
                  onClick={() => onDeletePermanently(course.courseId)}
                  className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded-lg text-sm font-medium"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrashSection;
