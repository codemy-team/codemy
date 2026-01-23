import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb.js";
import { env } from "../config/env.js";
import { User, SafeUser } from "../types/index.js";

interface CustomError extends Error {
  status?: number;
}

const sanitizeUser = (user: User): SafeUser => ({
  userId: user.userId,
  email: user.email,
  role: user.role,
});

interface RegisterParams {
  email: string;
  password: string;
}

export const registerUser = async ({
  email,
  password,
}: RegisterParams): Promise<SafeUser> => {
  const existing = await docClient.send(
    new GetCommand({
      TableName: env.usersTable,
      Key: { email },
    }),
  );
  if (existing.Item) {
    const error: CustomError = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    email,
    userId: crypto.randomUUID(),
    passwordHash,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: env.usersTable,
      Item: user,
    }),
  );

  return sanitizeUser(user);
};

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: SafeUser;
}

export const loginUser = async ({
  email,
  password,
}: LoginParams): Promise<LoginResult> => {
  const response = await docClient.send(
    new GetCommand({
      TableName: env.usersTable,
      Key: { email },
    }),
  );
  const user = response.Item as User | undefined;
  if (!user) {
    const error: CustomError = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error: CustomError = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { email: user.email, role: user.role },
    env.jwtSecret,
    {
      subject: user.userId,
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions,
  );

  return {
    token,
    user: sanitizeUser(user),
  };
};
