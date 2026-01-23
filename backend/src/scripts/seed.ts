import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";

const seedAdmin = async (): Promise<void> => {
  if (!env.adminEmail || !env.adminPassword) {
    console.log("Skipping admin seed (ADMIN_EMAIL/ADMIN_PASSWORD not set).");
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  const admin = {
    email: env.adminEmail,
    userId: crypto.randomUUID(),
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: env.usersTable,
      Item: admin,
    }),
  );
  console.log(`Seeded admin: ${admin.email}`);
};

const seedCourses = async (): Promise<void> => {
  const now = new Date().toISOString();
  const course = {
    courseId: "js-101",
    slug: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    summary: "Learn the core syntax and patterns of modern JavaScript.",
    description: "From variables to async workflows with hands-on demos.",
    category: "Programming",
    level: "Beginner",
    tags: ["javascript", "fundamentals"],
    instructor: "Alex Chen",
    rating: 4.7,
    durationMinutes: 420,
    createdAt: now,
    updatedAt: now,
    thumbnailUrl:
      "https://res.cloudinary.com/djpfddzh4/image/upload/v1768954284/main-sample.png",
    lectureCount: 2,
  };

  await docClient.send(
    new PutCommand({
      TableName: env.coursesTable,
      Item: course,
    }),
  );

  const items = [
    {
      courseId: course.courseId,
      itemId: crypto.randomUUID(),
      type: "video",
      title: "Intro to JavaScript",
      order: 100,
      storage: {
        provider: "cloudinary",
        resourceType: "video",
        publicId: "0_-_Introduction_qtov3c",
        url: "https://res.cloudinary.com/djpfddzh4/video/upload/v1768958210/0_-_Introduction_qtov3c.mp4",
      },
      url: "https://res.cloudinary.com/djpfddzh4/video/upload/v1768958210/0_-_Introduction_qtov3c.mp4",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      courseId: course.courseId,
      itemId: crypto.randomUUID(),
      type: "material",
      title: "JS Fundamentals Guide",
      order: 200,
      materialType: "pdf",
      storage: {
        provider: "cloudinary",
        resourceType: "raw",
        publicId: "1-introduction_k3hzcb",
        url: "https://res.cloudinary.com/demo/raw/upload/v1/js-101-guide.pdf",
      },
      url: "https://res.cloudinary.com/demo/raw/upload/v1/js-101-guide.pdf",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      courseId: course.courseId,
      itemId: crypto.randomUUID(),
      type: "quiz",
      title: "JS Basics Quiz",
      order: 300,
      questions: [
        {
          prompt: "Which keyword declares a variable?",
          choices: ["var", "loop", "echo"],
          correctIndex: 0,
        },
      ],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ].map((item) => ({
    ...item,
    sk: `item#${item.itemId}`,
  }));

  await Promise.all(
    items.map((item) =>
      docClient.send(
        new PutCommand({
          TableName: env.itemsTable,
          Item: item,
        }),
      ),
    ),
  );
  console.log("Seeded sample course and items.");
};

const run = async (): Promise<void> => {
  await seedAdmin();
  await seedCourses();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
