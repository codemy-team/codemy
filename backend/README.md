# Backend API (MVP)

Node.js + Express backend with DynamoDB and JWT auth.

## Base URL

`http://localhost:8000/api`

## Common Headers

- `Content-Type: application/json` for any request with a JSON body
- `Authorization: Bearer <JWT>` for protected routes (user/admin)

## Auth

### Register

`POST /auth/register`

Headers:

- `Content-Type: application/json`

Request:

```json
{ "email": "user@example.com", "password": "pass1234" }
```

Response:

```json
{ "user": { "userId": "uuid", "email": "user@example.com", "role": "user" } }
```

### Login

`POST /auth/login`

Headers:

- `Content-Type: application/json`

Request:

```json
{ "email": "user@example.com", "password": "pass1234" }
```

Response:

```json
{
  "token": "jwt-token",
  "user": { "userId": "uuid", "email": "user@example.com", "role": "user" }
}
```

## Courses (Public)

### List Courses

`GET /courses?search=&page=&pageSize=`

Query params:

- `search` (optional) searches title/summary/description/category/level/instructor/tags
- `page` (positive int, default `1`)
- `pageSize` (positive int, default `6`, max `50`)

Response:

```json
{
  "data": [
    {
      "courseId": "js-101",
      "title": "JavaScript Fundamentals",
      "summary": "...",
      "category": "Programming",
      "lectureCount": 3
    }
  ],
  "meta": { "page": 1, "pageSize": 6, "total": 10, "totalPages": 2 }
}
```

### Course Detail

`GET /courses/:courseId`

Path params:

- `courseId` (required)

Response:

```json
{
  "courseId": "js-101",
  "title": "JavaScript Fundamentals",
  "summary": "...",
  "description": "...",
  "category": "Programming",
  "level": "Beginner",
  "tags": ["javascript"],
  "instructor": "Alex Chen"
}
```

### Course Detail (by slug or courseId)

`GET /courses/by/:identifier`

`identifier` can be a `courseId` or `slug`.

### Course Items

`GET /courses/:courseId/items`

Path params:

- `courseId` (required)

Response:

```json
{
  "courseId": "js-101",
  "items": [
    {
      "itemId": "uuid",
      "type": "video",
      "title": "Intro",
      "order": 100,
      "storage": {
        "provider": "cloudinary",
        "resourceType": "video",
        "publicId": "courses/js-101/videos/intro",
        "url": "https://..."
      },
      "url": "https://..."
    },
    {
      "itemId": "uuid",
      "type": "material",
      "title": "Guide",
      "order": 200,
      "materialType": "pdf",
      "storage": {
        "provider": "cloudinary",
        "resourceType": "raw",
        "publicId": "courses/js-101/materials/guide",
        "url": "https://..."
      },
      "url": "https://..."
    },
    {
      "itemId": "uuid",
      "type": "quiz",
      "title": "Basics Quiz",
      "order": 300,
      "questions": [
        { "prompt": "...", "choices": ["a", "b", "c"], "correctIndex": 0 }
      ]
    }
  ]
}
```

Note: for quiz items, `correctIndex` is not returned in public items/resources.

### Course Resources (by slug or courseId)

`GET /courses/by/:identifier/resources`

Note: for quiz items, `correctIndex` is not returned in public resources.

## Quizzes

### Attempt Quiz (For public)

`POST /quizzes/:quizId/attempt`

Headers:

- `Content-Type: application/json`

Path params:

- `quizId` (required, using `itemId`)

Request:

```json
{ "answers": [0, 2, 1] }
```

Response:

```json
{
  "scorePercent": 67,
  "correctCount": 2,
  "total": 3,
  "review": [
    { "correct": true, "correctIndex": 0, "selectedIndex": 0 },
    { "correct": false, "correctIndex": 2, "selectedIndex": null }
  ]
}
```

## Admin (Auth: admin)

All admin endpoints require:

- `Authorization: Bearer <JWT>` (token must belong to an `admin` user)

### List Courses (Admin)

`GET /admin/courses?includeDeleted=true|false`

Query params:

- `includeDeleted` (optional, default `false`)
- `search` (optional)
- `page` (positive int, default `1`)
- `pageSize` (positive int, default `6`, max `50`)

### Create Course

`POST /admin/courses`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>`

Body (minimum):

```json
{ "title": "JavaScript Fundamentals", "slug": "javascript-fundamentals" }
```

Response:

```json
{ "courseId": "js-101", "title": "JavaScript Fundamentals" }
```

### Update Course

`PUT /admin/courses/:courseId`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>`

Body: any updatable course fields (title, summary, tags, etc.)

### Delete Course

`DELETE /admin/courses/:courseId`

Query params:

- `hard=true` for hard delete (default is soft delete)

### Create Item

`POST /admin/courses/:courseId/items`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>`

Body (minimum):

```json
{
  "type": "video",
  "title": "Intro",
  "order": 100,
  "storage": {
    "provider": "cloudinary",
    "resourceType": "video",
    "publicId": "courses/js-101/videos/intro",
    "url": "https://..."
  }
}
```

Item type rules:

- `type` must be `video` | `material` | `quiz` | `image`
- if `material`: include `materialType` (`pdf` or `zip`)
- media items (`video`/`material`/`image`) require `storage` or legacy `url`
- if `quiz`: include `questions` (array of `{ prompt, choices, correctIndex }`)

  ```json
  {
    "answers": [1,1,0]
  }
  ```

- if `order` not provided, server will assign `max(order) + 100` (starting at `100`)
- if `order` conflicts with an existing item, server will auto-assign `max(order) + 100`

### Update Item

`PUT /admin/items/:itemId`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>`

### Delete Course Item (Soft/Hard)

`DELETE /admin/courses/:courseId/items/:itemId?hard=true`

Headers:

- `Authorization: Bearer <JWT>`

### Reorder Items

`PATCH /admin/courses/:courseId/items/reorder`

Body:

```json
{ "items": [ { "itemId": "uuid", "order": 100 }, { "itemId": "uuid2", "order": 200 } ] }
```

Response:

```json
{ "ok": true }
```

### List Course Items (Admin)

`GET /admin/courses/:courseId/items?includeDeleted=true|false`

Default: `includeDeleted=true`

Optional filter:

- `type=quiz|video|material|image|raw`

## Error Format

All errors are returned as:

```json
{ "error": { "message": "Course not found" } }
```

## Local DynamoDB (Development)

### Option A (Recommended): NoSQL Workbench

1. Download and install **NoSQL Workbench for DynamoDB**
1. Start DynamoDB Local from the Workbench UI
1. Ensure it runs on port `8001`
1. Configure `.env`:

```bash
DYNAMODB_ENDPOINT=http://localhost:8001
DYNAMODB_LOCAL=true
AWS_REGION=us-east-1
```

1. If tables already exist, simply start the API:

```bash
npm run dev
```

For first-time setup:

```bash
npm run db:create
npm run seed
```

### Option B: Docker (Alternative)

If you prefer Docker:

```bash
docker run -p 8001:8000 amazon/dynamodb-local
```

Then follow the same steps above.

Note: no AWS account/keys are required when using DynamoDB Local.

## Slug Behavior (Courses)

- `slug` is optional on create; if not provided, it is generated from `title`
- `slug` is normalized to lowercase with `-` separators
- `slug` must be unique (409 "Slug already exists")

## Delete Semantics

- Items:
  - Soft delete (default): sets `deletedAt`
  - Hard delete: `?hard=true` removes the record and attempts Cloudinary delete
- Courses:
  - Soft delete (default): sets `deletedAt`
  - Hard delete: `?hard=true` removes the course and all items (best effort)

## Admin Upload (Cloudinary) - Work In Progress

Required env vars:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER_PREFIX` (optional, default `codemy`)

1. Sign upload (admin):

`POST /admin/uploads/sign`

Body:

```json
{ "resourceType": "video", "courseId": "js-101", "kind": "video" }
```

2. Frontend upload directly to Cloudinary:

FormData fields:

- `file`
- `api_key`
- `timestamp`
- `signature`
- `folder`
- `public_id` (optional)

3. Cloudinary response includes `public_id` + `secure_url` + `resource_type`

4. Create item using returned metadata:

`POST /admin/courses/:courseId/items`

```json
{
  "type": "video",
  "title": "Intro",
  "order": 100,
  "storage": {
    "provider": "cloudinary",
    "resourceType": "video",
    "publicId": "courses/js-101/videos/intro",
    "url": "https://..."
  }
}
```
