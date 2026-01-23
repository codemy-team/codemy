import { paginate } from "../utils/pagination.js";
import { Course } from "../types/index.js";

// Normalize search term to lowercase
const normalizeSearch = (value: string): string => value.trim().toLowerCase();

// Filter courses by search term (title, summary, description, category, level, instructor, tags)
export const filterCourses = (courses: Course[], search?: string): Course[] => {
  if (!search) {
    return courses;
  }
  const term = normalizeSearch(search);
  return courses.filter((course) => {
    const haystack = [
      course.title,
      course.summary,
      course.description,
      course.category,
      course.level,
      course.instructor,
      ...(course.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
};

// Build course list item with lecture count (fallback to stored value)
export const buildCourseListItem = (course: Course): Course => ({
  ...course,
  lectureCount: course.lectureCount ?? 0,
});

export interface ListCoursesParams {
  courses: Course[];
  search?: string;
  page: number;
  pageSize: number;
}

export interface ListCoursesResult {
  data: Course[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// List courses with pagination and search
export const listCoursesWithMeta = ({
  courses,
  search,
  page,
  pageSize,
}: ListCoursesParams): ListCoursesResult => {
  const filtered = filterCourses(courses, search);
  const paginated = paginate(filtered, page, pageSize);
  return {
    data: paginated.data.map(buildCourseListItem),
    meta: paginated.meta,
  };
};
