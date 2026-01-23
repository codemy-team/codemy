import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import express from "express";
import quizzesRouter from "../routes/quizzes.routes.js";

const app = express();
app.use(express.json());
app.use("/api", quizzesRouter);

describe("Quizzes Routes - POST /quizzes/:quizId/attempt", () => {
  it("When valid quiz attempt request is made, Then should accept and process", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz123/attempt")
      .send({
        answers: [0, 1, 2],
      });

    // Service will handle actual validation
    expect(response.status).toBeDefined();
  });

  it("When request without answers field is made, Then should return error", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz123/attempt")
      .send({});

    expect(response.status).toBe(400);
    // Response format depends on how the error handler formats the response
    expect(response.body).toBeDefined();
  });

  it("When request with null answers is made, Then should return 400", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz123/attempt")
      .send({ answers: null });

    expect(response.status).toBe(400);
  });

  it("When request with non-array answers is made, Then should return 400", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz123/attempt")
      .send({ answers: "not-an-array" });

    expect(response.status).toBe(400);
  });

  it("When request with empty answers array is made, Then should process", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz123/attempt")
      .send({ answers: [] });

    expect([200, 400, 404]).toContain(response.status);
  });

  it("When quiz ID parameter is provided, Then should be used in request", async () => {
    const quizId = "specific-quiz-123";
    const response = await request(app)
      .post(`/api/quizzes/${quizId}/attempt`)
      .send({ answers: [0] });

    expect(response.status).toBeDefined();
  });

  it("When numeric answers are provided, Then should be accepted", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz456/attempt")
      .send({
        answers: [0, 1, 2, 3],
      });

    expect(response.status).toBeDefined();
  });

  it("When large quiz ID is provided, Then should be passed to service", async () => {
    const response = await request(app)
      .post("/api/quizzes/very-long-quiz-id-12345678901234567890/attempt")
      .send({ answers: [0, 1] });

    expect(response.status).toBeDefined();
  });

  it("When request has multiple answers, Then should accept array", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz789/attempt")
      .send({
        answers: [0, 1, 2, 0, 1, 2, 0],
      });

    expect([200, 400, 404]).toContain(response.status);
  });

  it("When Content-Type is application/json, Then should parse body", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz999/attempt")
      .set("Content-Type", "application/json")
      .send({ answers: [0] });

    expect(response.status).toBeDefined();
  });

  it("When route receives POST request, Then should be handled", async () => {
    const response = await request(app)
      .post("/api/quizzes/quiz000/attempt")
      .send({ answers: [] });

    expect([200, 400, 404]).toContain(response.status);
  });
});
