import { Router, Request, Response, NextFunction } from "express";
import {
  getCourseById,
  getCourseByIdentifier,
  getCourseBySlug,
  listCourses,
} from "../services/courses.service.js";
import { listCourseItems } from "../services/items.service.js";
import { parsePositiveInt } from "../utils/pagination.js";
import { Item } from "../types/index.js";

const router = Router();

const sanitizeQuizForPublic = (item: Item): Item => {
  if (item.type !== "quiz") {
    return item;
  }
  const questions = Array.isArray(item.questions)
    ? item.questions.map((q: any) => ({
        prompt: q.prompt || q.question,
        choices: q.choices,
        correctIndex: q.correctIndex,
      }))
    : [];
  return {
    ...item,
    questions: questions as any, // Note: mapping changes structure, using any to preserve compatibility
  };
};

const sanitizeItemsForPublic = (items: Item[]): Item[] =>
  items.map(sanitizeQuizForPublic);

router.get(
  "/courses",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search =
        typeof req.query.search === "string" ? req.query.search : "";
      const page = parsePositiveInt(req.query.page, 1);
      const pageSizeRaw = parsePositiveInt(req.query.pageSize, 6);
      const pageSize = Math.min(Math.max(pageSizeRaw, 1), 50);

      const result = await listCourses({ search, page, pageSize });
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/courses/by/:identifier",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await getCourseByIdentifier(
        req.params.identifier as string,
      );
      if (!course) {
        return next({ status: 404, message: "Course not found" });
      }
      return res.json(course);
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/courses/by/:identifier/resources",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await getCourseByIdentifier(
        req.params.identifier as string,
      );
      if (!course) {
        return next({ status: 404, message: "Course not found" });
      }
      const items = await listCourseItems(course.courseId);
      const sanitizedItems = sanitizeItemsForPublic(items);
      return res.json({
        courseId: course.courseId,
        items: sanitizedItems,
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/courses/slug/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await getCourseBySlug(req.params.slug as string);
      if (!course) {
        return next({ status: 404, message: "Course not found" });
      }
      return res.json(course);
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/courses/:courseId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await getCourseById(req.params.courseId as string);
      if (!course) {
        return next({ status: 404, message: "Course not found" });
      }
      return res.json(course);
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/courses/:courseId/items",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await getCourseById(req.params.courseId as string);
      if (!course) {
        return next({ status: 404, message: "Course not found" });
      }
      const items = await listCourseItems(req.params.courseId as string);
      return res.json({
        courseId: req.params.courseId,
        items: sanitizeItemsForPublic(items),
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
