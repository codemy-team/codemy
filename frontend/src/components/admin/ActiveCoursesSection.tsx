import CourseForm from "./CourseForm";
import CourseCard from "./CourseCard";
import type {
  Course,
  NewCourseData,
  CourseItemsMap,
  LoadingItemsMap,
} from "../../types";

// Active Courses Section Component
interface ActiveCoursesSectionProps {
  courses: Course[];
  showForm: boolean;
  newCourse: NewCourseData;
  expandedCourse: string | null;
  courseItems: CourseItemsMap;
  loadingItems: LoadingItemsMap;
  onToggleForm: () => void;
  onCourseChange: (course: NewCourseData) => void;
  onCreateCourse: (e: React.FormEvent) => void;
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

const ActiveCoursesSection = ({
  courses,
  showForm,
  newCourse,
  expandedCourse,
  courseItems,
  loadingItems,
  onToggleForm,
  onCourseChange,
  onCreateCourse,
  onToggleExpand,
  onAddThumbnail,
  onAddVideo,
  onAddMaterial,
  onOpenAI,
  onDelete,
  onDeleteItem,
}: ActiveCoursesSectionProps) => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Courses</h2>
        <button
          onClick={onToggleForm}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            showForm
              ? "bg-gray-200 text-gray-700"
              : "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {showForm ? "Cancel" : "+ New Course"}
        </button>
      </div>

      {/* Create Course Form */}
      {showForm && (
        <CourseForm
          newCourse={newCourse}
          onChange={onCourseChange}
          onSubmit={onCreateCourse}
        />
      )}

      {/* Course List */}
      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No courses yet. Create your first course!</p>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              expanded={expandedCourse === course.courseId}
              items={courseItems[course.courseId] || []}
              loadingItems={loadingItems[course.courseId] || false}
              onToggleExpand={onToggleExpand}
              onAddThumbnail={onAddThumbnail}
              onAddVideo={onAddVideo}
              onAddMaterial={onAddMaterial}
              onOpenAI={onOpenAI}
              onDelete={onDelete}
              onDeleteItem={onDeleteItem}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveCoursesSection;
