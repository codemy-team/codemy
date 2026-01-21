import { Router } from "express";
import {
    getCourseById,
    getCourseByIdentifier,
    getCourseBySlug,
    listCourses
} from "../services/courses.service.js";
import { listCourseItems } from "../services/items.service.js";
import { parsePositiveInt } from "../utils/pagination.js";

const router = Router();

router.get("/courses", async (req, res, next) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : "";
        const page = parsePositiveInt(req.query.page, 1);
        const pageSizeRaw = parsePositiveInt(req.query.pageSize, 6);
        const pageSize = Math.min(Math.max(pageSizeRaw, 1), 50);

        const result = await listCourses({ search, page, pageSize });
        return res.json(result);
    } catch (error) {
        return next(error);
    }
});

router.get("/courses/by/:identifier", async (req, res, next) => {
    try {
        const course = await getCourseByIdentifier(req.params.identifier);
        if (!course) {
            return next({ status: 404, message: "Course not found" });
        }
        return res.json(course);
    } catch (error) {
        return next(error);
    }
});

router.get("/courses/by/:identifier/resources", async (req, res, next) => {
    try {
        const course = await getCourseByIdentifier(req.params.identifier);
        if (!course) {
            return next({ status: 404, message: "Course not found" });
        }
        const items = await listCourseItems(course.courseId);
        return res.json({
            courseId: course.courseId,
            items
        });
    } catch (error) {
        return next(error);
    }
});

router.get("/courses/slug/:slug", async (req, res, next) => {
    try {
        const course = await getCourseBySlug(req.params.slug);
        if (!course) {
            return next({ status: 404, message: "Course not found" });
        }
        return res.json(course);
    } catch (error) {
        return next(error);
    }
});

router.get("/courses/:courseId", async (req, res, next) => {
    try {
        const course = await getCourseById(req.params.courseId);
        if (!course) {
            return next({ status: 404, message: "Course not found" });
        }
        return res.json(course);
    } catch (error) {
        return next(error);
    }
});

router.get("/courses/:courseId/items", async (req, res, next) => {
    try {
        const course = await getCourseById(req.params.courseId);
        if (!course) {
            return next({ status: 404, message: "Course not found" });
        }
        const items = await listCourseItems(req.params.courseId);
        return res.json({
            courseId: req.params.courseId,
            items
        });
    } catch (error) {
        return next(error);
    }
});

router.get("/courses/:courseId/resources", async (req, res, next) => {
    try {
        const course = await getCourseById(req.params.courseId);
        if (!course) {
            return next({ status: 404, message: "Course not found" });
        }
        const items = await listCourseItems(req.params.courseId);
        return res.json({
            courseId: req.params.courseId,
            items
        });
    } catch (error) {
        return next(error);
    }
});

export default router;
