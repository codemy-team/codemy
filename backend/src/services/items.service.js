import crypto from "crypto";
import {
    DeleteCommand,
    PutCommand,
    QueryCommand,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";

const mapCourseItem = (item) => {
    if (!item) {
        return null;
    }
    const { pk, sk, ...rest } = item;
    return rest;
};

export const listCourseItems = async (courseId) => {
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
    return (response.Items || []).map(mapCourseItem);
};

const validateItemPayload = (payload) => {
    const type = payload.type;
    if (!["video", "material", "quiz"].includes(type)) {
        const error = new Error("Invalid item type");
        error.status = 400;
        throw error;
    }
    if (!payload.title) {
        const error = new Error("Title is required");
        error.status = 400;
        throw error;
    }
};

export const createCourseItem = async (courseId, payload) => {
    validateItemPayload(payload);
    const itemId = payload.itemId || crypto.randomUUID();
    const sk = `item#${payload.order}`;

    const item = {
        courseId,
        sk,
        itemId,
        type: payload.type,
        title: payload.title,
        order: payload.order
    };

    if (payload.type === "material") {
        item.materialType = payload.materialType || "pdf";
        item.url = payload.url || "";
    }

    if (payload.type === "video") {
        item.url = payload.url || "";
    }

    if (payload.type === "quiz") {
        item.questions = payload.questions || [];
    }

    await docClient.send(
        new PutCommand({
            TableName: env.itemsTable,
            Item: item
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
        sk: item.sk
    };

    await docClient.send(
        new PutCommand({
            TableName: env.itemsTable,
            Item: updated
        })
    );

    return mapCourseItem(updated);
};

export const deleteItemById = async (itemId) => {
    const item = await findItemById(itemId);
    if (!item) {
        const error = new Error("Item not found");
        error.status = 404;
        throw error;
    }
    await docClient.send(
        new DeleteCommand({
            TableName: env.itemsTable,
            Key: { courseId: item.courseId, sk: item.sk }
        })
    );
};

export const getQuizById = async (quizId) => {
    const item = await findItemById(quizId);
    if (!item || item.type !== "quiz") {
        return null;
    }
    return item;
};
