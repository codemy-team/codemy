import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";

const seedAdmin = async () => {
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
        createdAt: new Date().toISOString()
    };

    await docClient.send(
        new PutCommand({
            TableName: env.usersTable,
            Item: admin
        })
    );
    console.log(`Seeded admin: ${admin.email}`);
};

const seedCourses = async () => {
    const course = {
        courseId: "js-101",
        title: "JavaScript Fundamentals",
        summary: "Learn the core syntax and patterns of modern JavaScript.",
        description: "From variables to async workflows with hands-on demos.",
        category: "Programming",
        level: "Beginner",
        tags: ["javascript", "fundamentals"],
        instructor: "Alex Chen",
        rating: 4.7,
        durationMinutes: 420,
        updatedAt: new Date().toISOString(),
        thumbnailUrl: "https://picsum.photos/seed/js-101/640/360",
        lectureCount: 2
    };

    await docClient.send(
        new PutCommand({
            TableName: env.coursesTable,
            Item: course
        })
    );

    const items = [
        {
            courseId: course.courseId,
            sk: "item#100",
            itemId: crypto.randomUUID(),
            type: "video",
            title: "Intro to JavaScript",
            order: 100,
            url: "https://example.com/videos/js-101/intro"
        },
        {
            courseId: course.courseId,
            sk: "item#200",
            itemId: crypto.randomUUID(),
            type: "material",
            title: "JS Fundamentals Guide",
            order: 200,
            materialType: "pdf",
            url: "https://example.com/materials/js-101/guide.pdf"
        },
        {
            courseId: course.courseId,
            sk: "item#300",
            itemId: crypto.randomUUID(),
            type: "quiz",
            title: "JS Basics Quiz",
            order: 300,
            questions: [
                {
                    prompt: "Which keyword declares a variable?",
                    choices: ["var", "loop", "echo"],
                    correctIndex: 0
                }
            ]
        }
    ];

    await Promise.all(
        items.map((item) =>
            docClient.send(
                new PutCommand({
                    TableName: env.itemsTable,
                    Item: item
                })
            )
        )
    );
    console.log("Seeded sample course and items.");
};

const run = async () => {
    await seedAdmin();
    await seedCourses();
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
