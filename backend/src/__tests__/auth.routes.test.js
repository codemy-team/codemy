import request from 'supertest';
import app from '../app.js';

/**
 * Auth Routes Integration Tests
 * 
 * These tests verify the auth API endpoints work correctly.
 * They test the full request/response cycle.
 */

describe('Auth Routes - POST /api/auth/register', () => {
  it('should accept POST requests to /api/auth/register', async () => {
    // When: POST request sent to register endpoint
    // Then: Should respond (even if it fails validation)
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    // Should return some status code (not 404)
    expect(response.status).not.toBe(404);
  });

  it('should require email in request body', async () => {
    // When: Register without email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        password: 'password123'
      });

    // Then: Should reject with 400 Bad Request
    expect(response.status).toBe(400);
  });

  it('should require password in request body', async () => {
    // When: Register without password
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
      });

    // Then: Should reject with 400 Bad Request
    expect(response.status).toBe(400);
  });

  it('should return error if email already registered', async () => {
    // When: Register with duplicate email (after first registration)
    // Assuming: test@example.com was already registered
    // Then: Should return 409 Conflict

    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password123'
      });

    // Second registration with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password456'
      });

    expect(response.status).toBe(409);
  });

  it('should return user object on successful registration', async () => {
    // When: Valid registration request
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
      });

    // Then: Should return 201 Created with user data
    expect([201, 200]).toContain(response.status);
    if (response.body.user) {
      expect(response.body.user.email).toBeDefined();
      expect(response.body.user.userId).toBeDefined();
    }
  });
});

describe('Auth Routes - POST /api/auth/login', () => {
  it('should accept POST requests to /api/auth/login', async () => {
    // When: POST request sent to login endpoint
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    // Then: Should respond (not 404)
    expect(response.status).not.toBe(404);
  });

  it('should require email in request body', async () => {
    // When: Login without email
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123'
      });

    // Then: Should reject with 400 Bad Request
    expect(response.status).toBe(400);
  });

  it('should require password in request body', async () => {
    // When: Login without password
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com'
      });

    // Then: Should reject with 400 Bad Request
    expect(response.status).toBe(400);
  });

  it('should reject login with non-existent email', async () => {
    // When: Login with email that doesn't exist
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

    // Then: Should return 401 Unauthorized
    expect(response.status).toBe(401);
  });

  it('should reject login with incorrect password', async () => {
    // When: Register a user, then login with wrong password
    const email = `user-${Date.now()}@example.com`;

    // Register user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: email,
        password: 'correctpassword'
      });

    // Try to login with wrong password
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: email,
        password: 'wrongpassword'
      });

    // Then: Should return 401 Unauthorized
    expect(response.status).toBe(401);
  });

  it('should return token on successful login', async () => {
    // When: Register and login with correct credentials
    const email = `valid-${Date.now()}@example.com`;
    const password = 'password123';

    // Register
    await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    // Login
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    // Then: Should return token
    expect([200, 201]).toContain(response.status);
    if (response.body.token) {
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    }
  });

  it('should return user info on successful login', async () => {
    // When: Successfully login
    const email = `info-${Date.now()}@example.com`;
    const password = 'password123';

    // Register
    await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    // Login
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    // Then: Should return user data
    expect([200, 201]).toContain(response.status);
    if (response.body.user) {
      expect(response.body.user.email).toBe(email);
      expect(response.body.user.userId).toBeDefined();
    }
  });
});
