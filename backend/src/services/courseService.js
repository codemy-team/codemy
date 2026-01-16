import { courses } from "../data/courses.js";
import { paginate } from "../utils/pagination.js";

// Normalize search term to lowercase
const normalizeSearch = (value) => value.trim().toLowerCase();

// Filter courses by search term (title, summary, description, category, level, instructor, tags)
const filterCourses = (search) => {
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
            ...(course.tags || [])
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return haystack.includes(term);
    });
};

// Normalize order to a number, return fallback if not a number
const normalizeOrder = (value, fallback = 0) =>
    Number.isFinite(value) ? value : fallback;

// Build course list item with lecture count
const buildCourseListItem = (course) => {
    const lectureCount = course.resources?.lectures?.length || 0;
    const { resources, ...rest } = course;
    return {
        ...rest,
        lectureCount
    };
};

// Build resource items(lectures and materials)
export const buildResourceItems = (resources = {}) => {
    const lectures = Array.isArray(resources.lectures) ? resources.lectures : [];
    const materials = Array.isArray(resources.materials) ? resources.materials : [];
    const lectureItems = lectures.map((lecture) => ({
        id: lecture.id,
        kind: "lecture",
        title: lecture.title,
        order: normalizeOrder(lecture.order),
        url: lecture.videoUrl
    }));
    const materialItems = materials.map((material) => ({
        id: material.id,
        kind: "material",
        type: material.type,
        title: material.title,
        order: normalizeOrder(material.order),
        url: material.url
    }));
    return [...lectureItems, ...materialItems].sort((a, b) => a.order - b.order);
};

// List courses with pagination and search
export const listCoursesWithMeta = ({ search, page, pageSize }) => {
    const filtered = filterCourses(search);
    const paginated = paginate(filtered, page, pageSize);
    return {
        data: paginated.data.map(buildCourseListItem),
        meta: paginated.meta
    };
};

export const findCourseById = (courseId) =>
    courses.find((course) => course.id === courseId);
