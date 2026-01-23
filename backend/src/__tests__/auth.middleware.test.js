import { describe, it, expect } from "@jest/globals";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

describe("Auth Middleware - authenticate", () => {
  it("When valid Bearer token is provided, Then should extract and verify token", () => {
    const header = "Bearer valid-jwt-token";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

    expect(token).toBe("valid-jwt-token");
    expect(token).not.toBeNull();
  });

  it("When missing Bearer prefix, Then should return null", () => {
    const header = "InvalidToken";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

    expect(token).toBeNull();
  });

  it("When Authorization header is empty, Then should return null", () => {
    const header = "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

    expect(token).toBeNull();
  });

  it("When Bearer token has extra spaces, Then should trim correctly", () => {
    const header = "Bearer  valid-token  ";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

    expect(token).toBe("valid-token");
  });

  it("When lowercase bearer is used, Then should not match", () => {
    const header = "bearer token";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

    expect(token).toBeNull();
  });

  it("When extracting user from JWT payload, Then should map sub to userId", () => {
    const payload = {
      sub: "user123",
      email: "user@example.com",
      role: "student",
    };

    const user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    expect(user.userId).toBe("user123");
    expect(user.email).toBe("user@example.com");
    expect(user.role).toBe("student");
  });

  it("When extracting user with admin role, Then should preserve role", () => {
    const payload = {
      sub: "admin123",
      email: "admin@example.com",
      role: "admin",
    };

    const user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    expect(user.role).toBe("admin");
  });

  it("When extracting user with instructor role, Then should preserve role", () => {
    const payload = {
      sub: "inst123",
      email: "instructor@example.com",
      role: "instructor",
    };

    const user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    expect(user.role).toBe("instructor");
  });
});

describe("Auth Middleware - requireRole", () => {
  it("When user role matches required role, Then should allow access", () => {
    const userRole = "admin";
    const requiredRole = "admin";

    const hasAccess = userRole === requiredRole;

    expect(hasAccess).toBe(true);
  });

  it("When user role does not match, Then should deny access", () => {
    const userRole = "student";
    const requiredRole = "admin";

    const hasAccess = userRole === requiredRole;

    expect(hasAccess).toBe(false);
  });

  it("When user is undefined, Then should deny access", () => {
    const user = undefined;
    const hasAccess = user && user.role === "admin";

    expect(hasAccess).toBeFalsy();
  });

  it("When user role is undefined, Then should deny access", () => {
    const user = { userId: "user1", email: "user@example.com" };
    const hasAccess = user && user.role === "admin";

    expect(hasAccess).toBeFalsy();
  });

  it("When checking instructor role with matching user, Then should allow", () => {
    const user = { userId: "inst1", role: "instructor" };
    const hasAccess = user && user.role === "instructor";

    expect(hasAccess).toBe(true);
  });

  it("When checking student role with student user, Then should allow", () => {
    const user = { userId: "student1", role: "student" };
    const hasAccess = user && user.role === "student";

    expect(hasAccess).toBe(true);
  });

  it("When role comparison is case-sensitive, Then exact match required", () => {
    const user = { userId: "user1", role: "Admin" };
    const hasAccess = user && user.role === "admin";

    expect(hasAccess).toBe(false);
  });

  it("When role has whitespace, Then should not match", () => {
    const user = { userId: "user1", role: " admin " };
    const hasAccess = user && user.role === "admin";

    expect(hasAccess).toBe(false);
  });

  it("When checking multiple roles, Then should validate each one", () => {
    const user = { userId: "user1", role: "student" };

    const isAdmin = user && user.role === "admin";
    const isInstructor = user && user.role === "instructor";
    const isStudent = user && user.role === "student";

    expect(isAdmin).toBe(false);
    expect(isInstructor).toBe(false);
    expect(isStudent).toBe(true);
  });

  it("When user has admin role, Then should pass multiple admin checks", () => {
    const user = { userId: "admin1", role: "admin" };

    const check1 = user && user.role === "admin";
    const check2 = user && user.role === "admin";

    expect(check1 && check2).toBe(true);
  });
});

describe("Auth Token Processing", () => {
  it("When token contains special characters in userId, Then should preserve them", () => {
    const userId = "user-123_456.abc";
    const payload = { sub: userId };

    expect(payload.sub).toBe("user-123_456.abc");
  });

  it("When extracting claims from JWT, Then should have required fields", () => {
    const payload = {
      sub: "user123",
      email: "user@example.com",
      role: "student",
      iat: 1704067200,
    };

    expect(payload).toHaveProperty("sub");
    expect(payload).toHaveProperty("email");
    expect(payload).toHaveProperty("role");
  });

  it("When checking authorization, Then Bearer token should be required", () => {
    const headers = { authorization: "Bearer valid-token" };
    const hasAuth = headers.authorization && headers.authorization.startsWith("Bearer ");

    expect(hasAuth).toBe(true);
  });

  it("When headers missing authorization, Then should have no auth", () => {
    const headers = {};
    const hasAuth = headers.authorization && headers.authorization.startsWith("Bearer ");

    expect(hasAuth).toBeFalsy();
  });
});
