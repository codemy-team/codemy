import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";

const sanitizeUser = (user) => ({
    userId: user.userId,
    email: user.email,
    role: user.role
});

export const registerUser = async ({ email, password }) => {
    const existing = await docClient.send(
        new GetCommand({
            TableName: env.usersTable,
            Key: { email }
        })
    );
    if (existing.Item) {
        const error = new Error("Email already registered");
        error.status = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        email,
        userId: crypto.randomUUID(),
        passwordHash,
        role: "user",
        createdAt: new Date().toISOString()
    };

    await docClient.send(
        new PutCommand({
            TableName: env.usersTable,
            Item: user
        })
    );

    return sanitizeUser(user);
};

export const loginUser = async ({ email, password }) => {
    const response = await docClient.send(
        new GetCommand({
            TableName: env.usersTable,
            Key: { email }
        })
    );
    const user = response.Item;
    if (!user) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        { email: user.email, role: user.role },
        env.jwtSecret,
        {
            subject: user.userId,
            expiresIn: env.jwtExpiresIn
        }
    );

    return {
        token,
        user: sanitizeUser(user)
    };
};
