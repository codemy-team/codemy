# Codemy Frontend

React-based frontend for the Codemy online learning platform.

## Tech Stack

| Technology       | Purpose                           |
| ---------------- | --------------------------------- |
| React 18         | UI Framework                      |
| React Router DOM | Client-side Routing               |
| Tailwind CSS     | Styling                           |
| Vite             | Build Tool                        |
| Groq API         | AI Content Generation (LLaMA 3.3) |
| Cloudinary       | Media Storage (Video/PDF)         |

## Features

### Public Features (No Login Required)

- 🎓 Browse all courses
- 🔍 Search courses by title, instructor, category
- 📺 Watch course videos (Cloudinary-hosted)
- 📄 View PDF materials inline
- 📝 Take quizzes and get instant scores
- 📇 Study with interactive flashcards

### Admin Features (Login Required)

- ➕ Create new courses
- 🖼️ Upload course thumbnails
- 🎬 Upload course videos
- 📄 Upload PDF materials
- 🤖 **AI-Generated Quizzes** - Auto-generate quiz questions using Groq AI
- 🤖 **AI-Generated Flashcards** - Auto-generate flashcards for study
- 🗑️ Soft delete courses (move to trash)
- ♻️ Restore deleted courses
- 🔥 Hard delete courses (permanent)

## AI Content Generation

Codemy uses **Groq API** with the **LLaMA 3.3 70B** model to automatically generate educational content.

### Features

| Feature              | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| Quiz Generation      | Generate multiple-choice questions based on course title and level |
| Flashcard Generation | Generate front/back flashcards for study                           |

### How It Works

```
1. Admin selects a course and clicks "✨ AI"
           ↓
2. Choose content type: Quiz or Flashcards
           ↓
3. Frontend sends request to Groq API
   POST https://api.groq.com/openai/v1/chat/completions
   Model: llama-3.3-70b-versatile
           ↓
4. AI generates content based on course title + level
           ↓
5. Admin previews and saves to course
           ↓
6. Content stored in DynamoDB via backend API
```

### Groq API Configuration

The AI service is located in `src/services/gemini.js`:

```javascript
// API endpoint
https://api.groq.com/openai/v1/chat/completions

// Model used
llama-3.3-70b-versatile

// Temperature
0.7 (balanced creativity)
```

> **Note**: To use your own Groq API key, update the `GROQ_API_KEY` in `src/services/gemini.js`. Get your free API key at [console.groq.com](https://console.groq.com)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx       # Navigation bar with search
│   ├── Hero.jsx         # Homepage banner
│   ├── CourseCard.jsx   # Course card component
│   ├── Footer.jsx       # Footer component
│   └── Modal.jsx        # Reusable modal component
│
├── pages/               # Page components
│   ├── Home.jsx         # Homepage with course listing
│   ├── CourseDetail.jsx # Course details + content list
│   ├── VideoPlayer.jsx  # Video player / PDF viewer
│   ├── Quiz.jsx         # Quiz taking page
│   ├── Flashcard.jsx    # Flashcard study page
│   ├── Login.jsx        # Admin login page
│   └── AdminCMS.jsx     # Admin dashboard with AI generation
│
├── services/            # API service functions
│   ├── api.js           # Backend API calls
│   └── gemini.js        # Groq AI API (Quiz & Flashcard generation)
│
├── data/                # Static data (legacy)
│   └── courses.js       # Mock data (not used)
│
├── types/               # TypeScript types (future)
│   └── index.js
│
├── App.jsx              # Root component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles (Tailwind)
```

## Routes

| Path                 | Component    | Description                | Auth   |
| -------------------- | ------------ | -------------------------- | ------ |
| `/`                  | Home         | Course listing with search | Public |
| `/course/:courseId`  | CourseDetail | Course details + content   | Public |
| `/video/:itemId`     | VideoPlayer  | Video player / PDF viewer  | Public |
| `/quiz/:quizId`      | Quiz         | Quiz taking                | Public |
| `/flashcard/:itemId` | Flashcard    | Flashcard study            | Public |
| `/login`             | Login        | Admin login                | Public |
| `/admin`             | AdminCMS     | Admin dashboard            | Admin  |

## API Integration

The frontend connects to the backend API at `http://localhost:8000/api`.

### Public Endpoints Used

- `GET /courses` - List all courses (with search)
- `GET /courses/:courseId` - Get course details
- `GET /courses/:courseId/items` - Get course content (videos, quizzes, flashcards, materials)

### Admin Endpoints Used

- `POST /auth/login` - Admin login
- `POST /admin/courses` - Create course
- `PUT /admin/courses/:courseId` - Update course
- `DELETE /admin/courses/:courseId` - Soft delete
- `DELETE /admin/courses/:courseId?hard=true` - Hard delete
- `POST /admin/uploads/sign` - Get Cloudinary upload signature
- `POST /admin/courses/:courseId/items` - Add content to course (video/material/quiz/flashcard)
- `DELETE /admin/courses/:courseId/items/:itemId` - Delete course item
- `GET /admin/courses?includeDeleted=true` - List deleted courses

### External APIs Used

- **Groq API** - AI content generation (Quiz & Flashcard)
- **Cloudinary API** - Media upload (Video & PDF)

## Media Upload Flow

### Video Upload

```
1. Admin selects video file
           ↓
2. Frontend requests upload signature from backend
   POST /admin/uploads/sign { resourceType: "video" }
           ↓
3. Backend returns Cloudinary credentials
   { apiKey, timestamp, signature, uploadUrl, folder }
           ↓
4. Frontend uploads directly to Cloudinary
   POST https://api.cloudinary.com/v1_1/{cloud}/video/upload
           ↓
5. Cloudinary returns video URL
           ↓
6. Frontend saves video info to backend
   POST /admin/courses/:courseId/items { type: "video", ... }
```

### PDF Material Upload

```
1. Admin selects PDF file
           ↓
2. Frontend requests upload signature
   POST /admin/uploads/sign { resourceType: "raw" }
           ↓
3. Upload to Cloudinary as raw file
           ↓
4. Save material info to backend
   POST /admin/courses/:courseId/items { type: "material", materialType: "pdf", ... }
```

## Data Storage

| Data Type       | Storage Location | Notes                          |
| --------------- | ---------------- | ------------------------------ |
| Course metadata | DynamoDB         | title, instructor, category... |
| Videos          | Cloudinary       | Stored as video resource       |
| PDF Materials   | Cloudinary       | Stored as raw resource         |
| Thumbnails      | Cloudinary       | Stored as image resource       |
| Quiz questions  | DynamoDB         | Stored in course items table   |
| Flashcards      | DynamoDB         | Stored in course items table   |

## Admin Credentials

For development/testing:

- Email: `admin@codemy.dev`
- Password: `admin123`

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## Team

**Pilot React Batch - Group 6**

| Member      | Role                 |
| ----------- | -------------------- |
| Weiren      | Frontend Development |
| Fangqin     | Unit Testing         |
| Chunjingwen | Backend Development  |

## Related

- [Backend README](../backend/README.md)
- [Project Trello](https://trello.com/b/xMRbv4f8)
- [GitHub Repository](https://github.com/codemy-team/codemy)
