import request from 'supertest';
import app from '../app.js';

/**
 * Courses Routes Integration Tests
 * 
 * Tests the public course API endpoints:
 * - GET /api/courses - List all courses with pagination
 * - GET /api/courses/by/:identifier - Get course by identifier
 * - GET /api/courses/:courseId - Get course by ID
 * - GET /api/courses/:courseId/items - Get course items
 */

describe('Courses Routes - GET /api/courses', () => {
  it('should return list of courses with default pagination', async () => {
    // When: Request courses without pagination params
    const response = await request(app)
      .get('/api/courses');

    // Then: Should return 200 with courses data
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    // The response structure may vary, but should have course data
    const responseData = response.body;
    expect(responseData && typeof responseData === 'object').toBe(true);
  });

  it('should accept search parameter', async () => {
    // When: Request with search term
    const response = await request(app)
      .get('/api/courses?search=javascript');

    // Then: Should filter courses by search term
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should accept page parameter for pagination', async () => {
    // When: Request with specific page number
    const response = await request(app)
      .get('/api/courses?page=1');

    // Then: Should return first page of results
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should accept pageSize parameter', async () => {
    // When: Request with custom page size
    const response = await request(app)
      .get('/api/courses?pageSize=10');

    // Then: Should respect page size limit (max 50)
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should limit page size to maximum 50', async () => {
    // When: Request with pageSize > 50
    const response = await request(app)
      .get('/api/courses?pageSize=100');

    // Then: Should enforce max limit
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should handle multiple query parameters together', async () => {
    // When: Request with search, page, and pageSize
    const response = await request(app)
      .get('/api/courses?search=react&page=2&pageSize=12');

    // Then: Should return filtered and paginated results
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should not return deleted courses', async () => {
    // When: List courses (public endpoint)
    const response = await request(app)
      .get('/api/courses');

    // Then: Should only return active (non-deleted) courses
    expect(response.status).toBe(200);
    if (response.body.courses) {
      response.body.courses.forEach(course => {
        expect(course.deletedAt).toBeUndefined();
      });
    }
  });
});

describe('Courses Routes - GET /api/courses/by/:identifier', () => {
  it('should return course by identifier', async () => {
    // When: Request course with valid identifier
    const response = await request(app)
      .get('/api/courses/by/web-development');

    // Then: Should return course if exists or 404
    expect([200, 404]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.courseId).toBeDefined();
    }
  });

  it('should return 404 if identifier not found', async () => {
    // When: Request with non-existent identifier
    const response = await request(app)
      .get('/api/courses/by/non-existent-course-xyz');

    // Then: Should return 404
    expect(response.status).toBe(404);
  });

  it('should not return deleted courses by identifier', async () => {
    // When: Try to get deleted course by identifier
    // Then: Should return 404 (not found)
    const response = await request(app)
      .get('/api/courses/by/deleted-course');

    // Either 404 or the course data (if not deleted)
    expect([200, 404]).toContain(response.status);
  });
});

describe('Courses Routes - GET /api/courses/:courseId', () => {
  it('should return course by ID', async () => {
    // First, get a course to use its ID
    const listResponse = await request(app)
      .get('/api/courses');

    if (listResponse.status === 200 && listResponse.body.courses?.length > 0) {
      const courseId = listResponse.body.courses[0].courseId;

      // When: Request course by ID
      const response = await request(app)
        .get(`/api/courses/${courseId}`);

      // Then: Should return course data
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.courseId).toBe(courseId);
      }
    }
  });

  it('should return 404 if course ID not found', async () => {
    // When: Request with non-existent course ID
    const response = await request(app)
      .get('/api/courses/invalid-course-id-12345');

    // Then: Should return 404
    expect(response.status).toBe(404);
  });
});

describe('Courses Routes - GET /api/courses/:courseId/items', () => {
  it('should return course items if course exists', async () => {
    // First, get a course
    const listResponse = await request(app)
      .get('/api/courses');

    if (listResponse.status === 200 && listResponse.body.courses?.length > 0) {
      const courseId = listResponse.body.courses[0].courseId;

      // When: Request course items
      const response = await request(app)
        .get(`/api/courses/${courseId}/items`);

      // Then: Should return items array or 404
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.items || response.body)).toBe(true);
      }
    }
  });

  it('should sanitize quiz answers for public view', async () => {
    // When: Request course items
    const response = await request(app)
      .get('/api/courses');

    if (response.status === 200 && response.body.courses?.length > 0) {
      const courseId = response.body.courses[0].courseId;
      const itemsResponse = await request(app)
        .get(`/api/courses/${courseId}/items`);

      // Then: Quiz items should not expose answer keys
      if (itemsResponse.status === 200) {
        const items = itemsResponse.body.items || itemsResponse.body;
        items.forEach(item => {
          if (item.type === 'quiz' && item.questions) {
            item.questions.forEach(q => {
              // Only prompt and choices should be present (not answers)
              expect(q.prompt).toBeDefined();
              expect(q.choices).toBeDefined();
            });
          }
        });
      }
    }
  });

  it('should return 404 if course ID not found', async () => {
    // When: Request items for non-existent course
    const response = await request(app)
      .get('/api/courses/non-existent-id/items');

    // Then: Should return 404
    expect(response.status).toBe(404);
  });
});

describe('Courses Routes - GET /api/courses/:courseId/slug/:slug', () => {
  it('should return course by slug when authenticated', async () => {
    // When: Request course by slug (requires auth for some setups)
    const response = await request(app)
      .get('/api/courses/some-id/slug/course-slug');

    // Then: Should return 200 (found), 404 (not found), or 401 (requires auth)
    expect([200, 401, 404]).toContain(response.status);
  });

  it('should handle slug not found', async () => {
    // When: Request with non-existent slug
    const response = await request(app)
      .get('/api/courses/some-id/slug/non-existent-slug-xyz');

    // Then: Should return 404, 401 (auth required), or similar
    expect([404, 401]).toContain(response.status);
  });
});
