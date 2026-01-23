// fake data for courses
const courses = [
  {
    id: "cs221",
    title: "CS221: Artificial Intelligence",
    instructor: "Stanford University",
    thumbnail: "https://img.youtube.com/vi/J8Eh7RqggsU/maxresdefault.jpg",
    description: "Stanford's introductory course to Artificial Intelligence principles and techniques.",
    website: "https://stanford-cs221.github.io/autumn2021/",
    videos: [
      { id: "v1", title: "Lecture 1: Overview", youtubeId: "J8Eh7RqggsU" },
      { id: "v2", title: "Lecture 2: Machine Learning", youtubeId: "4dEwHQbCqnY" }
    ]
  },
  {
    id: "cs224n",
    title: "CS224n: Natural Language Processing",
    instructor: "Stanford University",
    thumbnail: "https://img.youtube.com/vi/rmVRLeJRkl4/maxresdefault.jpg",
    description: "Deep learning approaches for Natural Language Processing.",
    website: "https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1246/",
    videos: [
      { id: "v1", title: "Lecture 1: Introduction", youtubeId: "rmVRLeJRkl4" },
      { id: "v2", title: "Lecture 2: Word Vectors", youtubeId: "gqaHkPEZAew" }
    ]
  },
  {
    id: "cs230",
    title: "CS230: Deep Learning",
    instructor: "Stanford University",
    thumbnail: "https://img.youtube.com/vi/PySo_6S4ZAg/maxresdefault.jpg",
    description: "Deep learning fundamentals and practical applications.",
    website: "https://cs230.stanford.edu/syllabus/",
    videos: [
      { id: "v1", title: "Lecture 1: Introduction to Deep Learning", youtubeId: "PySo_6S4ZAg" }
    ]
  },
  {
    id: "cs231n",
    title: "CS231n: Deep Learning for Computer Vision",
    instructor: "Stanford University",
    thumbnail: "https://img.youtube.com/vi/vT1JzLTH4G4/maxresdefault.jpg",
    description: "Convolutional Neural Networks for Visual Recognition.",
    website: "https://cs231n.stanford.edu/",
    videos: [
      { id: "v1", title: "Lecture 1: Introduction", youtubeId: "vT1JzLTH4G4" }
    ]
  },
  {
    id: "git-github",
    title: "Git & GitHub Crash Course",
    instructor: "FreeCodeCamp",
    thumbnail: "https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg",
    description: "Learn Git and GitHub for version control.",
    website: null,
    videos: [
      { id: "v1", title: "Git and GitHub for Beginners", youtubeId: "RGOj5yH7evk" }
    ]
  },
  {
    id: "python-ai",
    title: "Python for AI - Full Course",
    instructor: "FreeCodeCamp",
    thumbnail: "https://img.youtube.com/vi/ygXn5nV5qFc/maxresdefault.jpg",
    description: "Complete Python course for AI and Machine Learning.",
    website: null,
    videos: [
      { id: "v1", title: "Full Course", youtubeId: "ygXn5nV5qFc" }
    ]
  }
];

export default courses;