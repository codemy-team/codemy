# Codemy Frontend

React-based frontend for the Codemy online learning platform.

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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
├── components/        # Reusable UI components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── CourseCard.tsx
│   └── Footer.tsx
├── pages/             # Page components
│   ├── Home.tsx
│   ├── CourseDetail.tsx
│   ├── VideoPlayer.tsx
│   ├── Login.tsx
│   └── AdminCMS.tsx
├── services/          # API service functions
│   ├── api.ts
│   ├── authService.ts
│   ├── courseService.ts
│   └── uploadService.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── data/              # Mock data (development only)
│   └── courses.ts
├── App.tsx            # Root component with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Available Routes

| Path                | Component    | Description                    |
| ------------------- | ------------ | ------------------------------ |
| `/`                 | Home         | Course listing page            |
| `/course/:courseId` | CourseDetail | Course details with video list |
| `/video/:videoId`   | VideoPlayer  | Video player page              |
| `/login`            | Login        | Admin login page               |
| `/admin`            | AdminCMS     | Course management (admin only) |

## API Integration

The frontend connects to the backend API at `http://localhost:8000/api`.

See [Backend README](../backend/README.md) for API documentation.

## Environment Variables

Create a `.env` file in the frontend directory:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |
