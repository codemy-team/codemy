export const courses = [
    {
        id: "ai-cs221-2021",
        title: "Stanford CS221: Artificial Intelligence: Principles and Techniques",
        summary: "Master the foundational principles of AI, covering modeling techniques from search and games to machine learning, logic, and probabilistic graphical models.",
        description: "This course (Autumn 2021 version) from Stanford University provides a deep dive into the design of AI systems. The content is structured around three main pillars: Machine Learning (data-driven models), Search and Games (state-based models), and Logic and Bayesian Networks (variable-based models).",
        category: "Artificial Intelligence",
        level: "Advanced",
        tags: ["AI", "Machine Learning", "Stanford", "Logic", "Search Algorithms"],
        instructor: "Percy Liang & Dorsa Sadigh",
        rating: 4.9,
        durationMinutes: 3600, 
        updatedAt: "2025-06-17",
        thumbnailUrl: "https://i.ytimg.com/vi/J8Eh7RqggsU/hqdefault.jpg",
        resources: {
          lectures: [
            {
              id: "cs221-lec-01",
              order: 100,
              title: "General Intro | Stanford CS221 (Autumn 2021)",
              durationMinutes: 68,
              videoUrl: "https://www.youtube.com/watch?v=J8Eh7RqggsU"
            },
            {
              id: "cs221-lec-02",
              order: 300,
              title: "AI History | Stanford CS221 (Autumn 2021)",
              durationMinutes: 18,
              videoUrl: "https://www.youtube.com/watch?v=07DveWpAis0"
            },
            {
              id: "cs221-lec-04",
              order: 500,
              title: "AI & Machine Learning 1 - Overview",
              durationMinutes: 7,
              videoUrl: "https://www.youtube.com/watch?v=9VvM2O_p4P0"
            },
            {
              id: "cs221-lec-05",
              order: 700,
              title: "AI & Machine Learning 2 - Linear Regression",
              durationMinutes: 23,
              videoUrl: "https://www.youtube.com/watch?v=uMvE6T_D5-w"
            }
          ],
          materials: [
            {
              id: "cs221-m1",
              order: 200,
              title: "Problem Workout Week 1",
              type: "pdf",
              url: "https://stanford-cs221.github.io/autumn2021-extra/workouts/week1.pdf"
            },
            {
              id: "cs221-m2",
              order: 600,
              title: "Assignment - Text Reconstruction",
              type: "html",
              url: "https://stanford-cs221.github.io/autumn2021/assignments/reconstruct/index.html"
            }
          ]
        }
      },
  {
    id: "js-101",
    title: "JavaScript Fundamentals",
    summary: "Learn the core syntax and patterns of modern JavaScript.",
    description:
      "Start from variables, functions, and arrays, then move to DOM basics and async workflows.",
    category: "Programming",
    level: "Beginner",
    tags: ["javascript", "fundamentals", "web"],
    instructor: "Alex Chen",
    rating: 4.7,
    durationMinutes: 420,
    updatedAt: "2025-12-10",
    thumbnailUrl: "https://picsum.photos/seed/js-101/640/360",
    resources: {
      lectures: [
        {
          id: "js-101-01",
          order: 100,
          title: "Intro to JavaScript",
          durationMinutes: 18,
          videoUrl: "https://example.com/videos/js-101/intro"
        },
        {
          id: "js-101-02",
          order: 300,
          title: "Functions and Scope",
          durationMinutes: 32,
          videoUrl: "https://example.com/videos/js-101/functions"
        },
        {
          id: "js-101-03",
          order: 500,
          title: "Async Basics",
          durationMinutes: 28,
          videoUrl: "https://example.com/videos/js-101/async"
        }
      ],
      materials: [
        {
          id: "js-101-m1",
          order: 200,
          title: "JS Fundamentals Guide",
          type: "pdf",
          url: "https://example.com/materials/js-101/guide.pdf"
        },
        {
          id: "js-101-m2",
          order: 400,
          title: "Practice Exercises",
          type: "zip",
          url: "https://example.com/materials/js-101/exercises.zip"
        }
      ]
    }
  },
  {
    id: "react-201",
    title: "React for Product Teams",
    summary: "Build reusable UI with hooks, state, and routing.",
    description:
      "A practical React course focused on building a product dashboard and reusable components.",
    category: "Frontend",
    level: "Intermediate",
    tags: ["react", "frontend", "hooks"],
    instructor: "Priya Rao",
    rating: 4.8,
    durationMinutes: 520,
    updatedAt: "2026-01-02",
    thumbnailUrl: "https://picsum.photos/seed/react-201/640/360",
    resources: {
      lectures: [
        {
          id: "react-201-01",
          order: 100,
          title: "Component Architecture",
          durationMinutes: 30,
          videoUrl: "https://example.com/videos/react-201/architecture"
        },
        {
          id: "react-201-02",
          order: 200,
          title: "Hooks in Depth",
          durationMinutes: 42,
          videoUrl: "https://example.com/videos/react-201/hooks"
        },
        {
          id: "react-201-03",
          order: 300,
          title: "Routing and Data",
          durationMinutes: 36,
          videoUrl: "https://example.com/videos/react-201/routing"
        }
      ],
      materials: [
        {
          id: "react-201-m1",
          order: 400,
          title: "React Patterns Playbook",
          type: "pdf",
          url: "https://example.com/materials/react-201/patterns.pdf"
        }
      ]
    }
  },
  {
    id: "uiux-105",
    title: "UI/UX Design Essentials",
    summary: "Principles and workflows for user-centered design.",
    description:
      "Cover user research, wireframing, prototyping, and testing with practical exercises.",
    category: "Design",
    level: "Beginner",
    tags: ["ui", "ux", "design"],
    instructor: "John Doe",
    rating: 4.6,
    durationMinutes: 360,
    updatedAt: "2025-11-18",
    thumbnailUrl: "https://picsum.photos/seed/uiux-105/640/360",
    resources: {
      lectures: [
        {
          id: "uiux-105-01",
          order: 100,
          title: "User Research Basics",
          durationMinutes: 24,
          videoUrl: "https://example.com/videos/uiux-105/research"
        },
        {
          id: "uiux-105-02",
          order: 300,
          title: "Wireframes to Prototypes",
          durationMinutes: 34,
          videoUrl: "https://example.com/videos/uiux-105/prototype"
        }
      ],
      materials: [
        {
          id: "uiux-105-m1",
          order: 200,
          title: "UX Checklist",
          type: "pdf",
          url: "https://example.com/materials/uiux-105/checklist.pdf"
        }
      ]
    }
  },
  {
    id: "data-150",
    title: "Data Analysis with Python",
    summary: "Analyze datasets with pandas, NumPy, and visualization tools.",
    description:
      "Learn to clean, explore, and visualize data using Python with real-world datasets.",
    category: "Data",
    level: "Beginner",
    tags: ["python", "data", "pandas"],
    instructor: "Jane Doe",
    rating: 4.5,
    durationMinutes: 480,
    updatedAt: "2025-10-22",
    thumbnailUrl: "https://picsum.photos/seed/data-150/640/360",
    resources: {
      lectures: [
        {
          id: "data-150-01",
          order: 100,
          title: "Intro to Pandas",
          durationMinutes: 26,
          videoUrl: "https://example.com/videos/data-150/pandas"
        },
        {
          id: "data-150-02",
          order: 300,
          title: "Data Visualization",
          durationMinutes: 33,
          videoUrl: "https://example.com/videos/data-150/visualization"
        }
      ],
      materials: [
        {
          id: "data-150-m1",
          order: 200,
          title: "Dataset: Customer Churn",
          type: "csv",
          url: "https://example.com/materials/data-150/churn.csv"
        },
        {
          id: "data-150-m2",
          order: 400,
          title: "Matplotlib Cheat Sheet",
          type: "pdf",
          url: "https://example.com/materials/data-150/matplotlib.pdf"
        }
      ]
    }
  },
  {
    id: "node-210",
    title: "Node.js API Foundations",
    summary: "Build REST APIs with Express, middleware, and testing.",
    description:
      "Create clean APIs, handle errors, and structure projects with Express best practices.",
    category: "Backend",
    level: "Intermediate",
    tags: ["node", "express", "api"],
    instructor: "John Doe",
    rating: 4.7,
    durationMinutes: 540,
    updatedAt: "2025-12-28",
    thumbnailUrl: "https://picsum.photos/seed/node-210/640/360",
    resources: {
      lectures: [
        {
          id: "node-210-01",
          order: 100,
          title: "REST Essentials",
          durationMinutes: 29,
          videoUrl: "https://example.com/videos/node-210/rest"
        },
        {
          id: "node-210-02",
          order: 200,
          title: "Express Middleware",
          durationMinutes: 31,
          videoUrl: "https://example.com/videos/node-210/middleware"
        },
        {
          id: "node-210-03",
          order: 300,
          title: "Error Handling",
          durationMinutes: 22,
          videoUrl: "https://example.com/videos/node-210/errors"
        }
      ],
      materials: [
        {
          id: "node-210-m1",
          order: 400,
          title: "API Starter Template",
          type: "zip",
          url: "https://example.com/materials/node-210/starter.zip"
        }
      ]
    }
  }
  
];
