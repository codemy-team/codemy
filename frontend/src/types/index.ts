// Type definitions for the frontend application

export interface User {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Course {
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  instructor?: string;
  category: string;
  level: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CourseItem {
  itemId: string;
  type: "video" | "quiz" | "flashcard" | "material";
  title: string;
  order: number;
  url?: string;
  storage?: Storage;
  questions?: QuizQuestion[];
  flashcards?: FlashCard[];
  materialType?: "pdf" | "zip";
}

export interface Storage {
  provider: string;
  resourceType: string;
  publicId: string;
  url: string;
}

export interface QuizQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  isFlashcard?: boolean;
}

export interface FlashCard {
  front: string;
  back: string;
}

export interface NewCourseData {
  title: string;
  slug: string;
  instructor: string;
  category: string;
  level: string;
}

export interface UploadData {
  title: string;
  file: File | null;
}

export interface ItemToDelete {
  courseId: string;
  itemId: string;
  title: string;
  type: string;
}

export interface ModalState {
  isOpen: boolean;
  type: string;
  course: Course | null;
}

export type UploadType = "video" | "image" | "material";
export type AIType = "quiz" | "flashcard";

export interface CourseItemsMap {
  [courseId: string]: CourseItem[];
}

export interface LoadingItemsMap {
  [courseId: string]: boolean;
}
