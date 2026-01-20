import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";
import { listCoursesWithMeta } from "./courseService.js";

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

export const createCourse = async (payload) => {
    const course = {
        courseId: payload.courseId,
        title: payload.title,
        summary: payload.summary || "",
        description: payload.description || "",
        category: payload.category || "",
        level: payload.level || "",
        tags: payload.tags || [],
        instructor: payload.instructor || "",
        rating: payload.rating || 0,
        durationMinutes: payload.durationMinutes || 0,
        updatedAt: payload.updatedAt || new Date().toISOString(),
        thumbnailUrl: payload.thumbnailUrl || "",
        lectureCount: payload.lectureCount || 0
    };

    await docClient.send(
        new PutCommand({
            TableName: env.coursesTable,
            Item: course
        })
    );

    return course;
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
