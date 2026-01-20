import crypto from "crypto";
import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    QueryCommand,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";
import { listCoursesWithMeta } from "./courseService.js";
import { slugify } from "../utils/slug.js";

export const listCourses = async ({ search, page, pageSize }) => {
    const response = await docClient.send(
        new ScanCommand({
            TableName: env.coursesTable
        })
    );
    const courses = response.Items || [];
    return listCoursesWithMeta({ courses, search, page, pageSize });
};

export const getCourseById = async (courseId) => {
    const response = await docClient.send(
        new GetCommand({
            TableName: env.coursesTable,
            Key: { courseId }
        })
    );
    return response.Item || null;
};

const slugExists = async (slug) => {
    const response = await docClient.send(
        new QueryCommand({
            TableName: env.coursesTable,
            IndexName: "slug-index",
            KeyConditionExpression: "slug = :slug",
            ExpressionAttributeValues: {
                ":slug": slug
            },
            Limit: 1
        })
    );
    return (response.Items || []).length > 0;
};

const buildCoursePayload = (payload, courseId, slug, timestamp) => ({
    courseId,
    slug,
    title: payload.title,
    summary: payload.summary || "",
    description: payload.description || "",
    category: payload.category || "",
    level: payload.level || "",
    tags: payload.tags || [],
    instructor: payload.instructor || "",
    rating: payload.rating || 0,
    durationMinutes: payload.durationMinutes || 0,
    thumbnailUrl: payload.thumbnailUrl || "",
    lectureCount: payload.lectureCount || 0,
    createdAt: timestamp,
    updatedAt: timestamp
});

export const createCourse = async (payload) => {
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    if (!title) {
        const error = new Error("Title is required");
        error.status = 400;
        throw error;
    }

    const slugSource =
        typeof payload.slug === "string" && payload.slug.trim()
            ? payload.slug
            : title;
    const slug = slugify(slugSource);
    if (!slug) {
        const error = new Error("Invalid slug");
        error.status = 400;
        throw error;
    }

    const exists = await slugExists(slug);
    if (exists) {
        const error = new Error("Slug already exists");
        error.status = 409;
        throw error;
    }

    const timestamp = new Date().toISOString();
    let attempt = 0;
    while (attempt < 2) {
        const courseId = `c_${crypto.randomUUID()}`;
        const course = buildCoursePayload(payload, courseId, slug, timestamp);
        try {
            await docClient.send(
                new PutCommand({
                    TableName: env.coursesTable,
                    Item: course,
                    ConditionExpression: "attribute_not_exists(courseId)"
                })
            );
            return course;
        } catch (error) {
            if (error.name === "ConditionalCheckFailedException") {
                attempt += 1;
                continue;
            }
            throw error;
        }
    }

    const error = new Error("Course already exists");
    error.status = 409;
    throw error;
};

export const updateCourse = async (courseId, updates) => {
    const existing = await getCourseById(courseId);
    if (!existing) {
        const error = new Error("Course not found");
        error.status = 404;
        throw error;
    }

    const course = {
        ...existing,
        ...updates,
        courseId,
        updatedAt: new Date().toISOString()
    };

    await docClient.send(
        new PutCommand({
            TableName: env.coursesTable,
            Item: course
        })
    );

    return course;
};

export const deleteCourse = async (courseId) => {
    await docClient.send(
        new DeleteCommand({
            TableName: env.coursesTable,
            Key: { courseId }
        })
    );
};

export const getCourseBySlug = async (slug) => {
    const normalized = slugify(slug || "");
    if (!normalized) {
        return null;
    }
    const response = await docClient.send(
        new QueryCommand({
            TableName: env.coursesTable,
            IndexName: "slug-index",
            KeyConditionExpression: "slug = :slug",
            ExpressionAttributeValues: {
                ":slug": normalized
            },
            Limit: 1
        })
    );
    return response.Items?.[0] || null;
};
