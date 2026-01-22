import { Router } from "express";
import { attemptQuiz } from "../services/quizzes.service.js";

const router = Router();

router.post("/quizzes/:quizId/attempt", async (req, res, next) => {
    try {
        const { answers } = req.body || {};
        if (!Array.isArray(answers)) {
            return next({ status: 400, message: "Answers must be an array" });
        }
        const result = await attemptQuiz({
            quizId: req.params.quizId,
            answers
        });
        return res.json(result);
    } catch (error) {
        return next(error);
    }
});

export default router;
