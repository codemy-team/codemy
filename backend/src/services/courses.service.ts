import crypto from "crypto";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";
import { listCoursesWithMeta } from "./courseService.js";
import { slugify } from "../utils/slug.js";
import { deleteItemsForCourse } from "./items.service.js";
import { Course, CoursePayload } from "../types/index.js";

interface CustomError extends Error {
  status?: number;
}

interface ListCoursesParams {
  search?: string;
  page: number;
  pageSize: number;
  includeDeleted?: boolean;
}

export const listCourses = async ({
  search,
  page,
  pageSize,
  includeDeleted = false,
}: ListCoursesParams) => {
  const response = await docClient.send(
    new ScanCommand({
      TableName: env.coursesTable,
    }),
  );
  const courses = (response.Items || []).filter(
    (course: any) => includeDeleted || course.deletedAt == null,
  ) as Course[];
  return listCoursesWithMeta({ courses, search, page, pageSize });
};

interface GetCourseOptions {
  includeDeleted?: boolean;
}

export const getCourseById = async (
  courseId: string,
  { includeDeleted = false }: GetCourseOptions = {},
): Promise<Course | null> => {
  const response = await docClient.send(
    new GetCommand({
      TableName: env.coursesTable,
      Key: { courseId },
    }),
  );
  if (!response.Item) {
    return null;
  }
  if (!includeDeleted && response.Item.deletedAt != null) {
    return null;
  }
  return response.Item as Course;
};

const slugExists = async (slug: string): Promise<boolean> => {
  const response = await docClient.send(
    new QueryCommand({
      TableName: env.coursesTable,
      IndexName: "slug-index",
      KeyConditionExpression: "slug = :slug",
      ExpressionAttributeValues: {
        ":slug": slug,
      },
      Limit: 1,
    }),
  );
  return (response.Items || []).length > 0;
};

const buildCoursePayload = (
  payload: CoursePayload,
  courseId: string,
  slug: string,
  timestamp: string,
): Course => ({
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
  updatedAt: timestamp,
});

export const createCourse = async (payload: CoursePayload): Promise<Course> => {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  if (!title) {
    const error: CustomError = new Error("Title is required");
    error.status = 400;
    throw error;
  }

  const slugSource =
    typeof payload.slug === "string" && payload.slug.trim()
      ? payload.slug
      : title;
  const slug = slugify(slugSource);
  if (!slug) {
    const error: CustomError = new Error("Invalid slug");
    error.status = 400;
    throw error;
  }

  const exists = await slugExists(slug);
  if (exists) {
    const error: CustomError = new Error("Slug already exists");
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
          ConditionExpression: "attribute_not_exists(courseId)",
        }),
      );
      return course;
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        attempt += 1;
        continue;
      }
      throw error;
    }
  }

  const error: CustomError = new Error("Course already exists");
  error.status = 409;
  throw error;
};

export const updateCourse = async (
  courseId: string,
  updates: Partial<CoursePayload>,
): Promise<Course> => {
  const existing = await getCourseById(courseId, { includeDeleted: true });
  if (!existing) {
    const error: CustomError = new Error("Course not found");
    error.status = 404;
    throw error;
  }

  const course: Course = {
    ...existing,
    ...updates,
    courseId,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: env.coursesTable,
      Item: course,
    }),
  );

  return course;
};

export const getCourseBySlug = async (
  slug: string,
  { includeDeleted = false }: GetCourseOptions = {},
): Promise<Course | null> => {
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
        ":slug": normalized,
      },
      Limit: 1,
    }),
  );
  const course = (response.Items?.[0] as Course | undefined) || null;
  if (!course) {
    return null;
  }
  if (!includeDeleted && course.deletedAt != null) {
    return null;
  }
  return course;
};

export const getCourseByIdentifier = async (
  identifier: string,
): Promise<Course | null> => {
  const byId = await getCourseById(identifier);
  if (byId) {
    return byId;
  }
  return getCourseBySlug(identifier);
};

interface DeleteCourseOptions {
  hard?: boolean;
}

export const deleteCourseById = async (
  courseId: string,
  { hard = false }: DeleteCourseOptions = {},
): Promise<void> => {
  const course = await getCourseById(courseId, { includeDeleted: true });
  if (!course) {
    const error: CustomError = new Error("Course not found");
    error.status = 404;
    throw error;
  }
  if (hard) {
    await deleteItemsForCourse(courseId);
    await docClient.send(
      new DeleteCommand({
        TableName: env.coursesTable,
        Key: { courseId },
      }),
    );
    return;
  }
  await docClient.send(
    new UpdateCommand({
      TableName: env.coursesTable,
      Key: { courseId },
      UpdateExpression: "SET deletedAt = :deletedAt, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":deletedAt": new Date().toISOString(),
        ":updatedAt": new Date().toISOString(),
      },
    }),
  );
};
