import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  port: number;
  awsRegion: string;
  dynamodbEndpoint: string;
  dynamodbLocal: boolean;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryFolderPrefix: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  coursesTable: string;
  itemsTable: string;
  usersTable: string;
  quizAttemptsTable: string;
  adminEmail: string;
  adminPassword: string;
}

export const env: EnvConfig = {
  port: parseInt(process.env.PORT || "8000", 10),
  awsRegion: process.env.AWS_REGION || "us-east-1",
  dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT || "",
  dynamodbLocal: process.env.DYNAMODB_LOCAL === "true",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryFolderPrefix: process.env.CLOUDINARY_FOLDER_PREFIX || "codemy",
  jwtSecret: process.env.JWT_SECRET || "dev-secret", // dev only
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  coursesTable: process.env.COURSES_TABLE || "Courses",
  itemsTable: process.env.ITEMS_TABLE || "Items",
  usersTable: process.env.USERS_TABLE || "Users",
  quizAttemptsTable: process.env.QUIZ_ATTEMPTS_TABLE || "QuizAttempts",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
};
