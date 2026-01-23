import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createCourse,
  getCourseById,
  listCourses,
  updateCourse,
  deleteCourseById,
} from "../services/courses.service.js";
import {
  createCourseItem,
  listCourseItemsAdmin,
  reorderCourseItems,
  updateItemById,
  deleteCourseItem,
} from "../services/items.service.js";
import { parsePositiveInt } from "../utils/pagination.js";
import { buildFolder, signUpload } from "../config/cloudinary.js";
import { env } from "../config/env.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("admin"));

router.get(
  "/admin/courses",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeDeleted = req.query.includeDeleted === "true";
      const search =
        typeof req.query.search === "string" ? req.query.search : "";
      const page = parsePositiveInt(req.query.page, 1);
      const pageSizeRaw = parsePositiveInt(req.query.pageSize, 6);
      const pageSize = Math.min(Math.max(pageSizeRaw, 1), 50);
      const result = await listCourses({
        search,
        page,
        pageSize,
        includeDeleted,
      });
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/admin/courses",
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);

router.put(
  "/admin/courses/:courseId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await updateCourse(
        req.params.courseId as string,
        req.body || {},
      );
      return res.json(course);
    } catch (error) {
      return next(error);
    }
  },
);

router.delete(
  "/admin/courses/:courseId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hard = req.query.hard === "true";
      await deleteCourseById(req.params.courseId as string, { hard });
      return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/admin/courses/:courseId/items",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, title } = req.body || {};
      const orderValue = parsePositiveInt(req.body?.order, 0);
      if (!type || !title) {
        return next({
          status: 400,
          message: "type and title are required",
        });
      }
      const course = await getCourseById(req.params.courseId as string);
      if (!course) {
        return next({ status: 404, message: "Course not found" });
      }
      const item = await createCourseItem(req.params.courseId as string, {
        ...req.body,
        order: orderValue || req.body?.order,
      });
      return res.status(201).json(item);
    } catch (error) {
      return next(error);
    }
  },
);

router.put(
  "/admin/items/:itemId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await updateItemById(
        req.params.itemId as string,
        req.body || {},
      );
      return res.json(item);
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/admin/uploads/sign",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (
        !env.cloudinaryCloudName ||
        !env.cloudinaryApiKey ||
        !env.cloudinaryApiSecret
      ) {
        return next({ status: 500, message: "Cloudinary is not configured" });
      }
      const { resourceType, courseId, kind, publicId, folder } = req.body || {};
      if (!resourceType) {
        return next({ status: 400, message: "resourceType is required" });
      }
      if (!["video", "image", "raw"].includes(resourceType)) {
        return next({ status: 400, message: "Invalid resourceType" });
      }
      const resolvedFolder =
        folder ||
        (courseId && kind
          ? `courses/${courseId}/${
              kind === "video"
                ? "videos"
                : kind === "material"
                  ? "materials"
                  : "thumbnails"
            }`
          : "");
      const signed = signUpload({
        resourceType,
        folder: buildFolder(resolvedFolder),
        publicId,
      });
      return res.json(signed);
    } catch (error) {
      return next(error);
    }
  },
);

router.delete(
  "/admin/courses/:courseId/items/:itemId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hard = req.query.hard === "true";
      await deleteCourseItem({
        courseId: req.params.courseId as string,
        itemId: req.params.itemId as string,
        hard,
      });
      return res.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  },
);

router.patch(
  "/admin/courses/:courseId/items/reorder",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = req.body?.items;
      await reorderCourseItems(req.params.courseId as string, items);
      return res.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/admin/courses/:courseId/items",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeDeleted = req.query.includeDeleted !== "false";
      const type = req.query.type;
      if (
        type &&
        !["quiz", "video", "material", "image", "raw"].includes(type as string)
      ) {
        return next({ status: 400, message: "Invalid type" });
      }
      let items = await listCourseItemsAdmin(req.params.courseId as string, {
        includeDeleted,
      });
      if (type) {
        items = items.filter((item) => item.type === type);
      }
      return res.json({
        courseId: req.params.courseId,
        items,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
