# Codemy

Codemy is a full-stack web project built with modern JavaScript technologies.
The repository contains both frontend and backend code for collaborative development.

---

## Project Structure

```text
Codemy/
├── frontend/   # React + Vite frontend
├── backend/    # Node.js + Express backend
├── README.md   # Project documentation
└── .gitignore
```

---

## Tech Stack

### Frontend

- React (JavaScript)
- Vite
- Tailwind CSS
- Runs on: [PORT 5173](http://localhost:5173)

### Backend

- Node.js + Express
- MongoDB (Mongoose)
- Runs on: [PORT 8000](http://localhost:8000) (default)

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repository-url>
cd Codemy
```

### 2. Install dependencies

**Frontend:**

```bash
cd frontend
npm install
```

**Backend:**

```bash
cd backend
npm install
```

---

## Environment Setup

Create a `.env` file in `backend/`:

```bash
PORT=8000
```

**`.env` synchronization**

Please follow the [shared doc](https://docs.google.com/document/d/1Q6nBGjcDkfp1SOV9e6_j5QvLHF0thnnNVoGToXBeJbI/edit?tab=t.0
) to keep environment variables consistent across the team.

---

## Run the Project

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

---

## Notes

- This is an initial project setup.
- Features, API documentation, and workflow details will be added later.
- Task tracking is managed via [Trello](https://trello.com/b/xMRbv4f8).
- Product spec & feature planning: see internal [project brainstorm docs](https://docs.google.com/document/d/1fTWWH1PFLv8k94liEDenikzwKsxM3m0kUoKll3tT728/edit?tab=t.m2quop39vr7s)
