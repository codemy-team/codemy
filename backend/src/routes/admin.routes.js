import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
    createCourse,
    updateCourse,
    deleteCourse
} from "../services/courses.service.js";
import {
    createCourseItem,
    updateItemById,
    deleteItemById
} from "../services/items.service.js";
import { parsePositiveInt } from "../utils/pagination.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("admin"));

router.post("/admin/courses", async (req, res, next) => {
    try {
        const { title } = req.body || {};
        if (!title || typeof title !== "string" || !title.trim()) {
            return next({ status: 400, message: "title is required" });
        }
        const { courseId, ...payload } = req.body || {};
        const course = await createCourse(payload);
        return res.status(201).json(course);
    } catch (error) {
        return next(error);
    }
});

router.put("/admin/courses/:courseId", async (req, res, next) => {
    try {
        const course = await updateCourse(req.params.courseId, req.body || {});
        return res.json(course);
    } catch (error) {
        return next(error);
    }
});

router.delete("/admin/courses/:courseId", async (req, res, next) => {
    try {
        await deleteCourse(req.params.courseId);
        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        return next(error);
    }
});

router.post("/admin/courses/:courseId/items", async (req, res, next) => {
    try {
        const { type, title, order } = req.body || {};
        const orderValue = parsePositiveInt(order, 0);
        if (!type || !title || !orderValue) {
            return next({
                status: 400,
                message: "type, title, and order are required"
            });
        }
        const item = await createCourseItem(req.params.courseId, {
            ...req.body,
            order: orderValue
        });
        return res.status(201).json(item);
    } catch (error) {
        return next(error);
    }
});

router.put("/admin/items/:itemId", async (req, res, next) => {
    try {
        const item = await updateItemById(req.params.itemId, req.body || {});
        return res.json(item);
    } catch (error) {
        return next(error);
    }
});

router.delete("/admin/items/:itemId", async (req, res, next) => {
    try {
        await deleteItemById(req.params.itemId);
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
});

export default router;
