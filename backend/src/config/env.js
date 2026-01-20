import dotenv from "dotenv";

dotenv.config();

export const env = {
    port: process.env.PORT || 8000,
    awsRegion: process.env.AWS_REGION || "us-east-1",
    dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT || "",
    dynamodbLocal: process.env.DYNAMODB_LOCAL === "true",
    jwtSecret: process.env.JWT_SECRET || "dev-secret", // dev only
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    coursesTable: process.env.COURSES_TABLE || "Courses",
    itemsTable: process.env.ITEMS_TABLE || "Items",
    usersTable: process.env.USERS_TABLE || "Users",
    quizAttemptsTable: process.env.QUIZ_ATTEMPTS_TABLE || "QuizAttempts",
    adminEmail: process.env.ADMIN_EMAIL || "",
    adminPassword: process.env.ADMIN_PASSWORD || ""
};
