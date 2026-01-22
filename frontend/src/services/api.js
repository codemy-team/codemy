const API_BASE_URL = "http://localhost:8000/api";

export const getCourses = async (page = 1, pageSize = 50, search = "") => {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.append("search", search);

  const response = await fetch(`${API_BASE_URL}/courses?${params}`);
  const data = await response.json();
  return data;
};

export const getCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
  const data = await response.json();
  return data;
};

export const getCourseItems = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/items`);
  const data = await response.json();
  return data;
};
