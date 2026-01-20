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

### Course Items

`GET /courses/:courseId/items`

Path params:

- `courseId` (required)

Response:

```json
{
  "courseId": "js-101",
  "items": [
    { "itemId": "uuid", "type": "video", "title": "Intro", "order": 100 },
    { "itemId": "uuid", "type": "material", "title": "Guide", "order": 200, "materialType": "pdf", "url": "https://..." },
    { "itemId": "uuid", "type": "quiz", "title": "Basics Quiz", "order": 300, "questions": [ { "prompt": "...", "choices": ["a","b","c"], "correctIndex": 0 } ] }
  ]
}
```

## Quizzes - Work In Progress

### Attempt Quiz (Auth: user)

`POST /quizzes/:quizId/attempt`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>`

Path params:

- `quizId` (required)

Request:

```json
{ "answers": [0, 2, 1] }
```

Response:

```json
{ "scorePercent": 67, "correctCount": 2, "total": 3 }
```

## Admin (Auth: admin)

All admin endpoints require:

- `Authorization: Bearer <JWT>` (token must belong to an `admin` user)

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

### Create Item

`POST /admin/courses/:courseId/items`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>`

Body (minimum):

```json
{ "type": "video", "title": "Intro", "order": 100 }
```

Item type rules:

- `type` must be `video` | `material` | `quiz`
- if `material`: include `materialType` and `url`
- if `video`: include `url`
- if `quiz`: include `questions` (array of `{ prompt, choices, correctIndex }`)

### Update Item

`PUT /admin/items/:itemId`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>`

### Delete Item

`DELETE /admin/items/:itemId`

Headers:

- `Authorization: Bearer <JWT>`

## Error Format

All errors are returned as:

```json
{ "error": { "message": "Course not found" } }
```

## Local DynamoDB (Development)

### Option A (Recommended): NoSQL Workbench

1. Download and install **NoSQL Workbench for DynamoDB**
2. Start DynamoDB Local from the Workbench UI
3. Ensure it runs on port `8001`
4. Configure `.env`:

```bash
DYNAMODB_ENDPOINT=http://localhost:8001
DYNAMODB_LOCAL=true
AWS_REGION=us-east-1
```

5. If tables already exist, simply start the API:

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
