import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import quizzesRoutes from "./routes/quizzes.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

app.use(express.json());

// CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "OPTIONS"],
        allowedHeaders: ["Content-Type"]
    })
);

app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", coursesRoutes);
app.use("/api", quizzesRoutes);
app.use("/api", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
