# Codemy Frontend

React-based frontend for the Codemy online learning platform.

## Tech Stack

| Technology       | Purpose             |
| ---------------- | ------------------- |
| React 18         | UI Framework        |
| React Router DOM | Client-side Routing |
| Tailwind CSS     | Styling             |
| Vite             | Build Tool          |

## Features

### Public Features (No Login Required)

- 🎓 Browse all courses
- 🔍 Search courses by title, instructor, category
- 📺 Watch course videos (Cloudinary-hosted)
- 📝 Take quizzes and get instant scores

### Admin Features (Login Required)

- ➕ Create new courses
- 🖼️ Upload course thumbnails
- 🎬 Upload course videos
- 🗑️ Soft delete courses (move to trash)
- ♻️ Restore deleted courses
- 🔥 Hard delete courses (permanent)

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
│   ├── CourseDetail.jsx # Course details + video list
│   ├── VideoPlayer.jsx  # Video player (Cloudinary)
│   ├── Quiz.jsx         # Quiz taking page
│   ├── Login.jsx        # Admin login page
│   └── AdminCMS.jsx     # Admin dashboard
│
├── services/            # API service functions
│   └── api.js           # Backend API calls
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

| Path                | Component    | Description                | Auth   |
| ------------------- | ------------ | -------------------------- | ------ |
| `/`                 | Home         | Course listing with search | Public |
| `/course/:courseId` | CourseDetail | Course details + videos    | Public |
| `/video/:videoId`   | VideoPlayer  | Video player               | Public |
| `/quiz/:quizId`     | Quiz         | Quiz taking                | Public |
| `/login`            | Login        | Admin login                | Public |
| `/admin`            | AdminCMS     | Admin dashboard            | Admin  |

## API Integration

The frontend connects to the backend API at `http://localhost:8000/api`.

### Public Endpoints Used

- `GET /courses` - List all courses (with search)
- `GET /courses/:courseId` - Get course details
- `GET /courses/:courseId/items` - Get course content (videos, quizzes)
- `POST /quizzes/:quizId/attempt` - Submit quiz answers

### Admin Endpoints Used

- `POST /auth/login` - Admin login
- `POST /admin/courses` - Create course
- `PUT /admin/courses/:courseId` - Update course
- `DELETE /admin/courses/:courseId` - Soft delete
- `DELETE /admin/courses/:courseId?hard=true` - Hard delete
- `POST /admin/uploads/sign` - Get Cloudinary upload signature
- `POST /admin/courses/:courseId/items` - Add video to course
- `GET /admin/courses?includeDeleted=true` - List deleted courses

## Video Upload Flow

```
1. Admin selects video file
           ↓
2. Frontend requests upload signature from backend
   POST /admin/uploads/sign
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
   POST /admin/courses/:courseId/items
```

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
