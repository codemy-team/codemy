# Backend API (phrase 1)

Simple Node.js + Express API for the Codemy. 

## Base URL

`http://localhost:8000/api`

## Endpoints

### Health Check

`GET /health`

Response:

```json
{ "status": "ok" }
```

### List Courses

`GET /courses`

Query params:

- `search` (string, optional)
- `page` (positive int, optional, default: 1)
- `pageSize` (positive int, optional, default: 6, max: 50)

Response:

```json
{
  "data": [
    {
      "id": "js-101",
      "title": "JavaScript Fundamentals",
      "summary": "...",
      "description": "...",
      "category": "Programming",
      "level": "Beginner",
      "tags": ["javascript"],
      "instructor": "Alex Chen",
      "rating": 4.7,
      "durationMinutes": 420,
      "updatedAt": "2025-12-10",
      "thumbnailUrl": "https://...",
      "lectureCount": 3
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 6,
    "total": 10,
    "totalPages": 2
  }
}
```

### Course Detail

`GET /courses/:courseId`

Response:

```json
{
  "id": "js-101",
  "title": "JavaScript Fundamentals",
  "summary": "...",
  "description": "...",
  "category": "Programming",
  "level": "Beginner",
  "tags": ["javascript"],
  "instructor": "Alex Chen",
  "rating": 4.7,
  "durationMinutes": 420,
  "updatedAt": "2025-12-10",
  "thumbnailUrl": "https://..."
}
```

### Course Resources

`GET /courses/:courseId/resources`

Response:

```json
{
  "courseId": "js-101",
  "items": [
    {
      "id": "js-101-01",
      "kind": "lecture",
      "title": "Intro to JavaScript",
      "order": 100,
      "url": "https://..."
    },
    {
      "id": "js-101-m1",
      "kind": "material",
      "type": "pdf",
      "title": "JS Fundamentals Guide",
      "order": 200,
      "url": "https://..."
    }
  ]
}
```

## Error Format

All errors are returned as:

```json
{ "error": { "message": "Course not found" } }
```
