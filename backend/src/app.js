import express from "express";
import cors from "cors";
import courseRoutes from "./routes/courseRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

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
app.use("/api", courseRoutes);

export default app;
