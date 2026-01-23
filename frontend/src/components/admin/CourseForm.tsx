import { CATEGORIES, LEVELS } from "./constants";
import type { NewCourseData } from "../../types";

// Course Form Component
interface CourseFormProps {
  newCourse: NewCourseData;
  onChange: (course: NewCourseData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CourseForm = ({ newCourse, onChange, onSubmit }: CourseFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100"
    >
      <h3 className="font-semibold text-gray-800 mb-4">Create New Course</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={newCourse.title}
            onChange={(e) => onChange({ ...newCourse, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Course Title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructor
          </label>
          <input
            type="text"
            value={newCourse.instructor}
            onChange={(e) =>
              onChange({ ...newCourse, instructor: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Instructor Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={newCourse.category}
            onChange={(e) =>
              onChange({ ...newCourse, category: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <select
            value={newCourse.level}
            onChange={(e) => onChange({ ...newCourse, level: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (auto)
          </label>
          <input
            type="text"
            value={newCourse.slug}
            onChange={(e) => onChange({ ...newCourse, slug: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="auto-generated"
          />
        </div>
      </div>
      <button
        type="submit"
        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
      >
        Create Course
      </button>
    </form>
  );
};

export default CourseForm;
