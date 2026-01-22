const API_BASE_URL = 'http://localhost:8000/api';

// get all courses
export const getCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/courses`);
  const data = await response.json();
  return data;
};

// get course by id
export const getCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
  const data = await response.json();
  return data;
};

// get course items (video list)
export const getCourseItems = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/items`);
  const data = await response.json();
  return data;
};