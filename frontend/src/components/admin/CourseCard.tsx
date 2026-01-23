import CourseItem from "./CourseItem";
import type { Course, CourseItem as CourseItemType } from "../../types";

// Course Card Component
interface CourseCardProps {
  course: Course;
  expanded: boolean;
  items: CourseItemType[];
  loadingItems: boolean;
  onToggleExpand: (courseId: string) => void;
  onAddThumbnail: (course: Course) => void;
  onAddVideo: (course: Course) => void;
  onAddMaterial: (course: Course) => void;
  onOpenAI: (course: Course) => void;
  onDelete: (course: Course) => void;
  onDeleteItem: (
    courseId: string,
    itemId: string,
    title: string,
    type: string,
  ) => void;
}

const CourseCard = ({
  course,
  expanded,
  items,
  loadingItems,
  onToggleExpand,
  onAddThumbnail,
  onAddVideo,
  onAddMaterial,
  onOpenAI,
  onDelete,
  onDeleteItem,
}: CourseCardProps) => {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 hover:bg-gray-100 transition-all group cursor-pointer"
        onClick={() => onToggleExpand(course.courseId)}
      >
        <div className="flex items-center gap-4">
          {/* Expand Arrow */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-8 h-8 text-white/80"
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
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{course.title}</h3>
            <p className="text-sm text-gray-500">
              {course.instructor || "No instructor"} ·{" "}
              {course.category || "General"} · {course.level || "All Levels"}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onAddThumbnail(course)}
            className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium"
          >
            + Thumb
          </button>
          <button
            onClick={() => onAddVideo(course)}
            className="px-3 py-1.5 text-purple-600 hover:bg-purple-100 rounded-lg text-sm font-medium"
          >
            + Video
          </button>
          <button
            onClick={() => onAddMaterial(course)}
            className="px-3 py-1.5 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium"
          >
            + PDF
          </button>
          <button
            onClick={() => onOpenAI(course)}
            className="px-3 py-1.5 text-yellow-600 hover:bg-yellow-100 rounded-lg text-sm font-medium"
          >
            ✨ AI
          </button>
          <button
            onClick={() => onDelete(course)}
            className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded-lg text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded Course Items */}
      {expanded && (
        <div className="border-t border-gray-200 bg-white p-4">
          {loadingItems ? (
            <div className="text-center py-4 text-gray-400">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading items...
            </div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No items in this course yet.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Course Items ({items.length})
              </p>
              {items.map((item) => (
                <CourseItem
                  key={item.itemId}
                  item={item}
                  courseId={course.courseId}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCard;
