import {
    buildResourceItems,
    findCourseById,
    listCoursesWithMeta
} from "../services/courseService.js";
import { parsePositiveInt } from "../utils/pagination.js";

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 100;

// Send not found response
const sendNotFound = (res) =>
    res.status(404).json({ error: { message: "Course not found" } });

// All courses with pagination and search
export const listCourses = (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const page = parsePositiveInt(req.query.page, 1);
    const pageSizeRaw = parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE);
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), MAX_PAGE_SIZE);

    const result = listCoursesWithMeta({ search, page, pageSize });
    res.json(result);
};

// Get course detail without resources
export const getCourseDetail = (req, res) => {
    const course = findCourseById(req.params.courseId);
    if (!course) {
        return sendNotFound(res);
    }
    const { resources, ...detail } = course;
    res.json(detail);
};

// Get course resources(lectures and materials)
export const getCourseResources = (req, res) => {
    const course = findCourseById(req.params.courseId);
    if (!course) {
        return sendNotFound(res);
    }
    res.json({
        courseId: course.id,
        items: buildResourceItems(course.resources)
    });
};
