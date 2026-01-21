import crypto from "crypto";
import {
    DeleteCommand,
    PutCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { cloudinary } from "../config/cloudinary.js";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";

const mapCourseItem = (item) => {
    if (!item) {
        return null;
    }
    const { pk, sk, questions, ...rest } = item;
    if (item.type === "quiz") {
        return { ...rest, questions };
    }
    return rest;
};

const listCourseItemsRaw = async (courseId) => {
    const response = await docClient.send(
        new QueryCommand({
            TableName: env.itemsTable,
            KeyConditionExpression: "courseId = :courseId AND begins_with(#sk, :prefix)",
            ExpressionAttributeNames: {
                "#sk": "sk"
            },
            ExpressionAttributeValues: {
                ":courseId": courseId,
                ":prefix": "item#"
            },
            ScanIndexForward: true
        })
    );
    return response.Items || [];
};

export const listCourseItems = async (courseId) => {
    const items = await listCourseItemsRaw(courseId);
    return items
        .filter((item) => item.deletedAt == null)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(mapCourseItem);
};

export const listCourseItemsAdmin = async (courseId, { includeDeleted = true } = {}) => {
    const items = await listCourseItemsRaw(courseId);
    return items
        .filter((item) => includeDeleted || item.deletedAt == null)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(mapCourseItem);
};

const normalizeOrderValue = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};

const resolveOrder = async (courseId, incomingOrder) => {
    const explicitOrder = normalizeOrderValue(incomingOrder);
    if (explicitOrder) {
        return explicitOrder;
    }
    const items = await listCourseItemsRaw(courseId);
    const maxOrder = items.reduce((max, item) => Math.max(max, item.order || 0), 0);
    return maxOrder ? maxOrder + 100 : 100;
};

const validateItemPayload = (payload) => {
    const type = payload.type;
    if (!["video", "material", "quiz", "image"].includes(type)) {
        const error = new Error("Invalid item type");
        error.status = 400;
        throw error;
    }
    if (!payload.title) {
        const error = new Error("Title is required");
        error.status = 400;
        throw error;
    }
    if (type === "material" && !payload.materialType) {
        const error = new Error("materialType is required for material items");
        error.status = 400;
        throw error;
    }
    if (type === "quiz" && payload.questions && !Array.isArray(payload.questions)) {
        const error = new Error("questions must be an array");
        error.status = 400;
        throw error;
    }
};

const normalizeStorage = (payload) => {
    if (payload.storage) {
        return payload.storage;
    }
    const { provider, resourceType, publicId, url } = payload;
    if (provider && resourceType && publicId && url) {
        return { provider, resourceType, publicId, url };
    }
    return null;
};

const ensureStorage = (type, storage, url) => {
    if (type === "quiz") {
        return null;
    }
    if (storage) {
        const { provider, resourceType, publicId, url: storageUrl } = storage;
        if (!provider || !resourceType || !publicId || !storageUrl) {
            const error = new Error("storage is missing required fields");
            error.status = 400;
            throw error;
        }
        if (provider !== "cloudinary") {
            const error = new Error("storage provider must be cloudinary");
            error.status = 400;
            throw error;
        }
        return storage;
    }
    if (url) {
        return null;
    }
    const error = new Error("storage is required for media items");
    error.status = 400;
    throw error;
};

export const createCourseItem = async (courseId, payload) => {
    validateItemPayload(payload);
    const itemId = payload.itemId || crypto.randomUUID();
    const order = await resolveOrder(courseId, payload.order);
    const sk = `item#${itemId}`;
    const timestamp = new Date().toISOString();
    const storage = normalizeStorage(payload);
    const normalizedStorage = ensureStorage(payload.type, storage, payload.url);

    const item = {
        courseId,
        sk,
        itemId,
        type: payload.type,
        title: payload.title,
        order,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null
    };

    if (payload.type === "material") {
        item.materialType = payload.materialType;
    }

    if (normalizedStorage) {
        item.storage = normalizedStorage;
        item.url = normalizedStorage.url;
    } else if (payload.url) {
        item.url = payload.url;
    }

    if (payload.type === "quiz") {
        item.questions = payload.questions || [];
    }

    await docClient.send(
        new PutCommand({
            TableName: env.itemsTable,
            Item: item,
            ConditionExpression: "attribute_not_exists(sk)"
        })
    );

    return mapCourseItem(item);
};

const findItemById = async (itemId) => {
    const response = await docClient.send(
        new ScanCommand({
            TableName: env.itemsTable,
            FilterExpression: "itemId = :itemId",
            ExpressionAttributeValues: {
                ":itemId": itemId
            }
        })
    );
    return response.Items?.[0] || null;
};

const findItemByCourseAndId = async (courseId, itemId) => {
    const items = await listCourseItemsRaw(courseId);
    return items.find((item) => item.itemId === itemId) || null;
};

export const updateItemById = async (itemId, updates) => {
    const item = await findItemById(itemId);
    if (!item) {
        const error = new Error("Item not found");
        error.status = 404;
        throw error;
    }

    const updated = {
        ...item,
        ...updates,
        itemId: item.itemId,
        courseId: item.courseId,
        sk: item.sk,
        updatedAt: new Date().toISOString()
    };

    await docClient.send(
        new PutCommand({
            TableName: env.itemsTable,
            Item: updated
        })
    );

    return mapCourseItem(updated);
};

export const deleteCourseItem = async ({ courseId, itemId, hard = false }) => {
    const item = await findItemByCourseAndId(courseId, itemId);
    if (!item) {
        const error = new Error("Item not found");
        error.status = 404;
        throw error;
    }

    if (item.storage?.provider === "cloudinary") {
        try {
            await cloudinary.uploader.destroy(item.storage.publicId, {
                resource_type: item.storage.resourceType
            });
        } catch (error) {
            console.error("Cloudinary delete failed:", error);
        }
    }

    if (hard) {
        await docClient.send(
            new DeleteCommand({
                TableName: env.itemsTable,
                Key: { courseId, sk: item.sk }
            })
        );
        return;
    }

    await docClient.send(
        new UpdateCommand({
            TableName: env.itemsTable,
            Key: { courseId, sk: item.sk },
            UpdateExpression: "SET deletedAt = :deletedAt, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
                ":deletedAt": new Date().toISOString(),
                ":updatedAt": new Date().toISOString()
            }
        })
    );
};

export const reorderCourseItems = async (courseId, updates) => {
    if (!Array.isArray(updates) || updates.length === 0) {
        const error = new Error("items is required");
        error.status = 400;
        throw error;
    }
    const items = await listCourseItemsRaw(courseId);
    const itemMap = new Map(items.map((item) => [item.itemId, item]));
    for (const update of updates) {
        if (!update.itemId || !itemMap.has(update.itemId)) {
            const error = new Error("All itemIds must belong to the course");
            error.status = 400;
            throw error;
        }
        if (normalizeOrderValue(update.order) == null) {
            const error = new Error("Each item must have a positive order");
            error.status = 400;
            throw error;
        }
    }

    await Promise.all(
        updates.map((update) =>
            docClient.send(
                new UpdateCommand({
                    TableName: env.itemsTable,
                    Key: { courseId, sk: itemMap.get(update.itemId).sk },
                    UpdateExpression: "SET #order = :order, updatedAt = :updatedAt",
                    ExpressionAttributeNames: {
                        "#order": "order"
                    },
                    ExpressionAttributeValues: {
                        ":order": normalizeOrderValue(update.order),
                        ":updatedAt": new Date().toISOString()
                    }
                })
            )
        )
    );
};

export const deleteItemsForCourse = async (courseId) => {
    const items = await listCourseItemsRaw(courseId);
    await Promise.all(
        items.map((item) =>
            deleteCourseItem({
                courseId,
                itemId: item.itemId,
                hard: true
            })
        )
    );
};

export const getQuizById = async (quizId) => {
    const item = await findItemById(quizId);
    if (!item || item.type !== "quiz" || item.deletedAt != null) {
        return null;
    }
    return item;
};
