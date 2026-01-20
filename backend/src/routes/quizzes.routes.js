import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { attemptQuiz } from "../services/quizzes.service.js";

const router = Router();

router.post("/quizzes/:quizId/attempt", authenticate, async (req, res, next) => {
    try {
        const { answers } = req.body || {};
        if (!Array.isArray(answers)) {
            return next({ status: 400, message: "Answers must be an array" });
        }
        const result = await attemptQuiz({
            quizId: req.params.quizId,
            userId: req.user.userId,
            answers
        });
        return res.json(result);
    } catch (error) {
        return next(error);
    }
});

export default router;
