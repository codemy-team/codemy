import crypto from "crypto";
import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { cloudinary } from "../config/cloudinary.js";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";
import { Item, ItemPayload, Storage, QuizItem } from "../types/index.js";

interface CustomError extends Error {
  status?: number;
}

const mapCourseItem = (item: any): Item | null => {
  if (!item) {
    return null;
  }
  const { pk, sk, questions, flashcards, ...rest } = item;
  if (item.type === "quiz") {
    return { ...rest, questions } as Item;
  }
  if (item.type === "flashcard") {
    return { ...rest, flashcards } as Item;
  }
  return rest as Item;
};

const listCourseItemsRaw = async (courseId: string): Promise<any[]> => {
  const response = await docClient.send(
    new QueryCommand({
      TableName: env.itemsTable,
      KeyConditionExpression:
        "courseId = :courseId AND begins_with(#sk, :prefix)",
      ExpressionAttributeNames: {
        "#sk": "sk",
      },
      ExpressionAttributeValues: {
        ":courseId": courseId,
        ":prefix": "item#",
      },
      ScanIndexForward: true,
    }),
  );
  return response.Items || [];
};

export const listCourseItems = async (courseId: string): Promise<Item[]> => {
  const items = await listCourseItemsRaw(courseId);
  return items
    .filter((item) => item.deletedAt == null)
    .sort((a, b) => {
      const orderDiff = (a.order || 0) - (b.order || 0);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return (a.createdAt || "").localeCompare(b.createdAt || "");
    })
    .map(mapCourseItem)
    .filter((item): item is Item => item !== null);
};

interface ListItemsAdminOptions {
  includeDeleted?: boolean;
}

export const listCourseItemsAdmin = async (
  courseId: string,
  { includeDeleted = true }: ListItemsAdminOptions = {},
): Promise<Item[]> => {
  const items = await listCourseItemsRaw(courseId);
  return items
    .filter((item) => includeDeleted || item.deletedAt == null)
    .sort((a, b) => {
      const orderDiff = (a.order || 0) - (b.order || 0);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return (a.createdAt || "").localeCompare(b.createdAt || "");
    })
    .map(mapCourseItem)
    .filter((item): item is Item => item !== null);
};

const normalizeOrderValue = (
  value: number | string | undefined,
): number | null => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const resolveOrder = async (
  courseId: string,
  incomingOrder?: number | string,
): Promise<number> => {
  const explicitOrder = normalizeOrderValue(incomingOrder);
  const items = await listCourseItemsRaw(courseId);
  const maxOrder = items.reduce(
    (max, item) => Math.max(max, item.order || 0),
    0,
  );
  if (explicitOrder) {
    const hasDuplicate = items.some((item) => item.order === explicitOrder);
    if (!hasDuplicate) {
      return explicitOrder;
    }
  }
  return maxOrder ? maxOrder + 100 : 100;
};

const validateItemPayload = (payload: ItemPayload): void => {
  const type = payload.type;
  if (!["video", "material", "quiz", "image", "flashcard"].includes(type)) {
    const error: CustomError = new Error("Invalid item type");
    error.status = 400;
    throw error;
  }
  if (!payload.title) {
    const error: CustomError = new Error("Title is required");
    error.status = 400;
    throw error;
  }
  if (type === "material" && !payload.materialType) {
    const error: CustomError = new Error(
      "materialType is required for material items",
    );
    error.status = 400;
    throw error;
  }
  if (
    type === "quiz" &&
    payload.questions &&
    !Array.isArray(payload.questions)
  ) {
    const error: CustomError = new Error("questions must be an array");
    error.status = 400;
    throw error;
  }
};

const normalizeStorage = (payload: ItemPayload): Storage | null => {
  if (payload.storage) {
    return payload.storage;
  }
  const { provider, resourceType, publicId, url } = payload;
  if (provider && resourceType && publicId && url) {
    return { provider, resourceType, publicId, url };
  }
  return null;
};

const ensureStorage = (
  type: string,
  storage: Storage | null,
  url?: string,
): Storage | null => {
  if (type === "quiz" || type === "flashcard") {
    return null;
  }
  if (storage) {
    const { provider, resourceType, publicId, url: storageUrl } = storage;
    if (!provider || !resourceType || !publicId || !storageUrl) {
      const error: CustomError = new Error(
        "storage is missing required fields",
      );
      error.status = 400;
      throw error;
    }
    if (provider !== "cloudinary") {
      const error: CustomError = new Error(
        "storage provider must be cloudinary",
      );
      error.status = 400;
      throw error;
    }
    return storage;
  }
  if (url) {
    return null;
  }
  const error: CustomError = new Error("storage is required for media items");
  error.status = 400;
  throw error;
};

export const createCourseItem = async (
  courseId: string,
  payload: ItemPayload,
): Promise<Item> => {
  validateItemPayload(payload);
  const itemId = payload.itemId || crypto.randomUUID();
  const order = await resolveOrder(courseId, payload.order);
  const sk = `item#${itemId}`;
  const timestamp = new Date().toISOString();
  const storage = normalizeStorage(payload);
  const normalizedStorage = ensureStorage(payload.type, storage, payload.url);

  const item: any = {
    courseId,
    sk,
    itemId,
    type: payload.type,
    title: payload.title,
    order,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
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

  if (payload.type === "flashcard") {
    item.flashcards = payload.flashcards || [];
  }

  await docClient.send(
    new PutCommand({
      TableName: env.itemsTable,
      Item: item,
      ConditionExpression: "attribute_not_exists(sk)",
    }),
  );

  return mapCourseItem(item) as Item;
};

const findItemById = async (itemId: string): Promise<any | null> => {
  const response = await docClient.send(
    new ScanCommand({
      TableName: env.itemsTable,
      FilterExpression: "itemId = :itemId",
      ExpressionAttributeValues: {
        ":itemId": itemId,
      },
    }),
  );
  return response.Items?.[0] || null;
};

const findItemByCourseAndId = async (
  courseId: string,
  itemId: string,
): Promise<any | null> => {
  const items = await listCourseItemsRaw(courseId);
  return items.find((item) => item.itemId === itemId) || null;
};

export const updateItemById = async (
  itemId: string,
  updates: Partial<ItemPayload>,
): Promise<Item> => {
  const item = await findItemById(itemId);
  if (!item) {
    const error: CustomError = new Error("Item not found");
    error.status = 404;
    throw error;
  }

  const updated = {
    ...item,
    ...updates,
    itemId: item.itemId,
    courseId: item.courseId,
    sk: item.sk,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: env.itemsTable,
      Item: updated,
    }),
  );

  return mapCourseItem(updated) as Item;
};

interface DeleteItemOptions {
  courseId: string;
  itemId: string;
  hard?: boolean;
}

export const deleteCourseItem = async ({
  courseId,
  itemId,
  hard = false,
}: DeleteItemOptions): Promise<void> => {
  const item = await findItemByCourseAndId(courseId, itemId);
  if (!item) {
    const error: CustomError = new Error("Item not found");
    error.status = 404;
    throw error;
  }

  if (item.storage?.provider === "cloudinary") {
    try {
      await cloudinary.uploader.destroy(item.storage.publicId, {
        resource_type: item.storage.resourceType,
      });
    } catch (error) {
      console.error("Cloudinary delete failed:", error);
    }
  }

  if (hard) {
    await docClient.send(
      new DeleteCommand({
        TableName: env.itemsTable,
        Key: { courseId, sk: item.sk },
      }),
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
        ":updatedAt": new Date().toISOString(),
      },
    }),
  );
};

interface ReorderUpdate {
  itemId: string;
  order: number | string;
}

export const reorderCourseItems = async (
  courseId: string,
  updates: ReorderUpdate[],
): Promise<void> => {
  if (!Array.isArray(updates) || updates.length === 0) {
    const error: CustomError = new Error("items is required");
    error.status = 400;
    throw error;
  }
  const items = await listCourseItemsRaw(courseId);
  const itemMap = new Map(items.map((item) => [item.itemId, item]));
  for (const update of updates) {
    if (!update.itemId || !itemMap.has(update.itemId)) {
      const error: CustomError = new Error(
        "All itemIds must belong to the course",
      );
      error.status = 400;
      throw error;
    }
    if (normalizeOrderValue(update.order) == null) {
      const error: CustomError = new Error(
        "Each item must have a positive order",
      );
      error.status = 400;
      throw error;
    }
  }

  await Promise.all(
    updates.map((update) =>
      docClient.send(
        new UpdateCommand({
          TableName: env.itemsTable,
          Key: { courseId, sk: itemMap.get(update.itemId)!.sk },
          UpdateExpression: "SET #order = :order, updatedAt = :updatedAt",
          ExpressionAttributeNames: {
            "#order": "order",
          },
          ExpressionAttributeValues: {
            ":order": normalizeOrderValue(update.order),
            ":updatedAt": new Date().toISOString(),
          },
        }),
      ),
    ),
  );
};

export const deleteItemsForCourse = async (courseId: string): Promise<void> => {
  const items = await listCourseItemsRaw(courseId);
  await Promise.all(
    items.map((item) =>
      deleteCourseItem({
        courseId,
        itemId: item.itemId,
        hard: true,
      }),
    ),
  );
};

export const getQuizById = async (quizId: string): Promise<QuizItem | null> => {
  const item = await findItemById(quizId);
  if (!item || item.type !== "quiz" || item.deletedAt != null) {
    return null;
  }
  return item as QuizItem;
};
