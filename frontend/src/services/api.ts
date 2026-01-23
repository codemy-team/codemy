import type { Course, CourseItem } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

interface CoursesResponse {
  data: Course[];
  metadata?: {
    page: number;
    pageSize: number;
    totalItems?: number;
  };
}

interface CourseItemsResponse {
  items: CourseItem[];
}

export const getCourses = async (
  page: number | string = 1,
  pageSize: number | string = 50,
  search = "",
): Promise<CoursesResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.append("search", search);

  const response = await fetch(`${API_BASE_URL}/courses?${params}`);
  const data = await response.json();
  return data;
};

export const getCourse = async (
  courseId: string | undefined,
): Promise<Course> => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
  const data = await response.json();
  return data;
};

export const getCourseItems = async (
  courseId: string | undefined,
): Promise<CourseItemsResponse> => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/items`);
  const data = await response.json();
  return data;
};
