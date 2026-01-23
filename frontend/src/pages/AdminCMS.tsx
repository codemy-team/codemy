import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateQuiz, generateFlashcards } from "../services/gemini";

const API_BASE_URL = "http://localhost:8000/api";

const CATEGORIES = [
  "Programming",
  "Web Development",
  "Data Science",
  "AI & Machine Learning",
  "Design",
  "Business",
  "Other",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const AdminCMS = () => {
  const [courses, setCourses] = useState([]);
  const [deletedCourses, setDeletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    slug: "",
    instructor: "",
    category: "Programming",
    level: "Beginner",
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState("video");
  const [uploadData, setUploadData] = useState({ title: "", file: null });
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "", course: null });
  const [successMessage, setSuccessMessage] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiType, setAiType] = useState("quiz");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseItems, setCourseItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null); // { courseId, itemId, title, type }
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchCourses();
    fetchDeletedCourses();
  }, [navigate]);

  const getToken = () => localStorage.getItem("token");

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const data = await response.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedCourses = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/courses?includeDeleted=true`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await response.json();
      const deleted = (data.data || []).filter((c) => c.deletedAt);
      setDeletedCourses(deleted);
    } catch (error) {
      console.error("Failed to fetch deleted courses:", error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        title: newCourse.title,
        category: newCourse.category,
        level: newCourse.level,
      };
      if (newCourse.slug) courseData.slug = newCourse.slug;
      if (newCourse.instructor) courseData.instructor = newCourse.instructor;

      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Failed to create course");
      }

      setNewCourse({
        title: "",
        slug: "",
        instructor: "",
        category: "Programming",
        level: "Beginner",
      });
      setShowForm(false);
      fetchCourses();
      showSuccess("Course created successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteCourse = async (courseId, hard = false) => {
    setModal({ isOpen: false, type: "", course: null });
    try {
      const url = hard
        ? `${API_BASE_URL}/admin/courses/${courseId}?hard=true`
        : `${API_BASE_URL}/admin/courses/${courseId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to delete course");

      fetchCourses();
      fetchDeletedCourses();
      showSuccess(
        hard ? "Course permanently deleted!" : "Course moved to trash!"
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRestoreCourse = async (courseId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/courses/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ deletedAt: null }),
        }
      );

      if (!response.ok) throw new Error("Failed to restore course");

      fetchCourses();
      fetchDeletedCourses();
      showSuccess("Course restored successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchCourseItems = async (courseId) => {
    setLoadingItems((prev) => ({ ...prev, [courseId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/items`);
      const data = await response.json();
      setCourseItems((prev) => ({ ...prev, [courseId]: data.items || [] }));
    } catch (error) {
      console.error("Failed to fetch course items:", error);
      setCourseItems((prev) => ({ ...prev, [courseId]: [] }));
    } finally {
      setLoadingItems((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleToggleExpand = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (!courseItems[courseId]) {
        fetchCourseItems(courseId);
      }
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    const { courseId, itemId } = itemToDelete;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/courses/${courseId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete item");

      // Refresh items for this course
      fetchCourseItems(courseId);
      showSuccess("Item deleted successfully!");
    } catch (error) {
      alert(error.message);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !selectedCourse) return;

    setUploading(true);
    try {
      const isImage = uploadType === "image";
      const isMaterial = uploadType === "material";

      const resourceType = isImage ? "image" : isMaterial ? "raw" : "video";
      const kind = isImage ? "image" : isMaterial ? "material" : "video";

      const signResponse = await fetch(`${API_BASE_URL}/admin/uploads/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          resourceType,
          courseId: selectedCourse.courseId,
          kind,
        }),
      });

      if (!signResponse.ok) throw new Error("Failed to get upload signature");
      const signData = await signResponse.json();

      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const cloudinaryResponse = await fetch(signData.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!cloudinaryResponse.ok)
        throw new Error("Failed to upload to Cloudinary");
      const cloudinaryData = await cloudinaryResponse.json();

      if (isImage) {
        await fetch(
          `${API_BASE_URL}/admin/courses/${selectedCourse.courseId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ thumbnailUrl: cloudinaryData.secure_url }),
          }
        );
        fetchCourses();
      } else {
        const itemData = {
          type: isMaterial ? "material" : "video",
          title: uploadData.title,
          order: 100,
          storage: {
            provider: "cloudinary",
            resourceType: isMaterial ? "raw" : "video",
            publicId: cloudinaryData.public_id,
            url: cloudinaryData.secure_url,
          },
        };
        if (isMaterial) {
          itemData.materialType = uploadData.file.name.endsWith(".pdf")
            ? "pdf"
            : "zip";
        }

        await fetch(
          `${API_BASE_URL}/admin/courses/${selectedCourse.courseId}/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(itemData),
          }
        );
        fetchCourseItems(selectedCourse.courseId);
      }

      setUploadData({ title: "", file: null });
      setShowUpload(false);
      setSelectedCourse(null);
      showSuccess(
        `${isImage ? "Thumbnail" : isMaterial ? "Material" : "Video"} uploaded!`
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedCourse) return;
    setAiGenerating(true);
    setGeneratedContent(null);

    try {
      const content =
        aiType === "quiz"
          ? await generateQuiz(
              selectedCourse.title,
              selectedCourse.level || "Beginner",
              5
            )
          : await generateFlashcards(
              selectedCourse.title,
              selectedCourse.level || "Beginner",
              10
            );

      setGeneratedContent(content);
    } catch (error) {
      alert("Failed to generate content: " + error.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveGeneratedContent = async () => {
    if (!generatedContent || !selectedCourse) return;

    try {
      const itemData = {
        type: aiType === "quiz" ? "quiz" : "flashcard",
        title: selectedCourse.title,
        order: 200,
      };

      if (aiType === "quiz") {
        itemData.questions = generatedContent;
      } else {
        itemData.flashcards = generatedContent;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/courses/${selectedCourse.courseId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(itemData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error?.message ||
            "Failed to save content"
        );
      }

      fetchCourseItems(selectedCourse.courseId);
      setShowAIModal(false);
      setGeneratedContent(null);
      setSelectedCourse(null);
      showSuccess(
        `${aiType === "quiz" ? "Quiz" : "Flashcards"} saved successfully!`
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-6 right-6 z-50 animate-fade-in-down">
            <div className="bg-white border-l-4 border-emerald-500 rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[300px]">
              <div className="bg-emerald-100 rounded-full p-2">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Success</p>
                <p className="text-sm text-gray-600">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {modal.isOpen && modal.type === "delete" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
              onClick={() =>
                setModal({ isOpen: false, type: "", course: null })
              }
            />
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Delete Course
                </h3>
                <p className="text-gray-500 mt-2">"{modal.course?.title}"</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    handleDeleteCourse(modal.course.courseId, false)
                  }
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  Move to Trash
                </button>
                <button
                  onClick={() =>
                    handleDeleteCourse(modal.course.courseId, true)
                  }
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Permanently
                </button>
                <button
                  onClick={() =>
                    setModal({ isOpen: false, type: "", course: null })
                  }
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Item Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
              onClick={() => setItemToDelete(null)}
            />
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Delete {itemToDelete.type}
                </h3>
                <p className="text-gray-500 mt-2">"{itemToDelete.title}"</p>
                <p className="text-gray-400 text-sm mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleDeleteItem}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Permanently
                </button>
                <button
                  onClick={() => setItemToDelete(null)}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Generation Modal */}
        {showAIModal && selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
              onClick={() => {
                setShowAIModal(false);
                setGeneratedContent(null);
                setSelectedCourse(null);
              }}
            />
            <div className="relative bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                AI Content Generator
              </h3>
              <p className="text-gray-500 mb-6">
                Generate content for "{selectedCourse.title}"
              </p>

              {/* Type Selection */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => {
                    setAiType("quiz");
                    setGeneratedContent(null);
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    aiType === "quiz"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  🎯 Quiz
                </button>
                <button
                  onClick={() => {
                    setAiType("flashcard");
                    setGeneratedContent(null);
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    aiType === "flashcard"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  📇 Flashcards
                </button>
              </div>

              {/* Generate Button */}
              {!generatedContent && (
                <button
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating with AI...
                    </span>
                  ) : (
                    `✨ Generate ${aiType === "quiz" ? "Quiz" : "Flashcards"}`
                  )}
                </button>
              )}

              {/* Preview Generated Content */}
              {generatedContent && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Preview:</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {aiType === "quiz"
                      ? generatedContent.map((q, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl">
                            <p className="font-medium text-gray-800 mb-2">
                              {i + 1}. {q.prompt}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {q.choices.map((c, j) => (
                                <div
                                  key={j}
                                  className={`text-sm p-2 rounded ${
                                    j === q.correctIndex
                                      ? "bg-green-100 text-green-700"
                                      : "bg-white"
                                  }`}
                                >
                                  {c} {j === q.correctIndex && "✓"}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      : generatedContent.map((card, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl">
                            <p className="font-medium text-gray-800">
                              Front: {card.front}
                            </p>
                            <p className="text-gray-600 mt-1">
                              Back: {card.back}
                            </p>
                          </div>
                        ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setGeneratedContent(null)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={handleSaveGeneratedContent}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Save to Course
                    </button>
                  </div>
                </div>
              )}

              {/* Close */}
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setGeneratedContent(null);
                  setSelectedCourse(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowDeleted(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !showDeleted
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Active Courses ({courses.length})
          </button>
          <button
            onClick={() => setShowDeleted(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showDeleted
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Trash ({deletedCourses.length})
          </button>
        </div>

        {/* Active Courses */}
        {!showDeleted && (
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">All Courses</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  showForm
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {showForm ? "Cancel" : "+ New Course"}
              </button>
            </div>

            {/* Create Course Form */}
            {showForm && (
              <form
                onSubmit={handleCreateCourse}
                className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100"
              >
                <h3 className="font-semibold text-gray-800 mb-4">
                  Create New Course
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, title: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Course Title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={newCourse.instructor}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          instructor: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Instructor Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newCourse.category}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, category: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      value={newCourse.level}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, level: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (auto)
                    </label>
                    <input
                      type="text"
                      value={newCourse.slug}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, slug: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="auto-generated"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Create Course
                </button>
              </form>
            )}

            {/* Course List */}
            <div className="space-y-3">
              {courses.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No courses yet. Create your first course!</p>
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.courseId}
                    className="bg-gray-50 rounded-xl overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-4 hover:bg-gray-100 transition-all group cursor-pointer"
                      onClick={() => handleToggleExpand(course.courseId)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Expand Arrow */}
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedCourse === course.courseId
                              ? "rotate-90"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg
                              className="w-8 h-8 text-white/80"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {course.instructor || "No instructor"} ·{" "}
                            {course.category || "General"} ·{" "}
                            {course.level || "All Levels"}
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setUploadType("image");
                            setShowUpload(true);
                          }}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium"
                        >
                          + Thumb
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setUploadType("video");
                            setShowUpload(true);
                          }}
                          className="px-3 py-1.5 text-purple-600 hover:bg-purple-100 rounded-lg text-sm font-medium"
                        >
                          + Video
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setUploadType("material");
                            setShowUpload(true);
                          }}
                          className="px-3 py-1.5 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium"
                        >
                          + PDF
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowAIModal(true);
                          }}
                          className="px-3 py-1.5 text-yellow-600 hover:bg-yellow-100 rounded-lg text-sm font-medium"
                        >
                          ✨ AI
                        </button>
                        <button
                          onClick={() =>
                            setModal({ isOpen: true, type: "delete", course })
                          }
                          className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded-lg text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Expanded Course Items */}
                    {expandedCourse === course.courseId && (
                      <div className="border-t border-gray-200 bg-white p-4">
                        {loadingItems[course.courseId] ? (
                          <div className="text-center py-4 text-gray-400">
                            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            Loading items...
                          </div>
                        ) : !courseItems[course.courseId] ||
                          courseItems[course.courseId].length === 0 ? (
                          <div className="text-center py-4 text-gray-400">
                            No items in this course yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600 mb-3">
                              Course Items (
                              {courseItems[course.courseId].length})
                            </p>
                            {courseItems[course.courseId].map((item) => {
                              const isFlashcard =
                                (item.type === "quiz" &&
                                  item.questions?.some((q) => q.isFlashcard)) ||
                                item.type === "flashcard";
                              let icon, typeLabel;

                              if (item.type === "material") {
                                icon = "📄";
                                typeLabel = "PDF";
                              } else if (isFlashcard) {
                                icon = "📇";
                                typeLabel = "Flashcard";
                              } else if (item.type === "quiz") {
                                icon = "🎯";
                                typeLabel = "Quiz";
                              } else {
                                icon = "▶";
                                typeLabel = "Video";
                              }

                              return (
                                <div
                                  key={item.itemId}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">{icon}</span>
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {item.title}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {typeLabel}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setItemToDelete({
                                        courseId: course.courseId,
                                        itemId: item.itemId,
                                        title: item.title,
                                        type: typeLabel,
                                      })
                                    }
                                    className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded-lg text-sm font-medium transition-all"
                                  >
                                    Delete
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Trash */}
        {showDeleted && (
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Trash</h2>
            <div className="space-y-3">
              {deletedCourses.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Trash is empty</p>
                </div>
              ) : (
                deletedCourses.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Deleted:{" "}
                        {new Date(course.deletedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreCourse(course.courseId)}
                        className="px-3 py-1.5 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteCourse(course.courseId, true)
                        }
                        className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded-lg text-sm font-medium"
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
              onClick={() => {
                setShowUpload(false);
                setSelectedCourse(null);
                setUploadData({ title: "", file: null });
              }}
            />
            <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Upload{" "}
                {uploadType === "image"
                  ? "Thumbnail"
                  : uploadType === "material"
                  ? "Material (PDF)"
                  : "Video"}
              </h3>
              <p className="text-gray-500 mb-6">
                Adding to "{selectedCourse.title}"
              </p>
              <form onSubmit={handleUpload}>
                {uploadType !== "image" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, title: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={
                        uploadType === "material"
                          ? "Course Syllabus"
                          : "Lecture 1"
                      }
                      required
                    />
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File *
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all">
                    <div className="flex flex-col items-center justify-center">
                      {uploadData.file ? (
                        <>
                          <svg
                            className="w-8 h-8 text-green-500 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <p className="text-sm font-medium text-gray-700">
                            {uploadData.file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-8 h-8 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-purple-600">
                              Click to upload
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {uploadType === "image"
                              ? "PNG, JPG, WEBP"
                              : uploadType === "material"
                              ? "PDF, ZIP"
                              : "MP4, MOV, AVI"}
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept={
                        uploadType === "image"
                          ? "image/*"
                          : uploadType === "material"
                          ? ".pdf,.zip"
                          : "video/*"
                      }
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          file: e.target.files[0],
                        })
                      }
                      required
                    />
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpload(false);
                      setSelectedCourse(null);
                      setUploadData({ title: "", file: null });
                    }}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      uploading ||
                      !uploadData.file ||
                      (uploadType !== "image" && !uploadData.title)
                    }
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
