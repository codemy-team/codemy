import { Router } from "express";
import {
    getCourseDetail,
    getCourseResources,
    listCourses
} from "../controllers/courseController.js";

const router = Router();

router.get("/courses", listCourses);
router.get("/courses/:courseId", getCourseDetail);
router.get("/courses/:courseId/resources", getCourseResources);

export default router;
