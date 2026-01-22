import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

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
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState("video");
  const [uploadData, setUploadData] = useState({ title: "", file: null });
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "", course: null });
  const [successMessage, setSuccessMessage] = useState("");
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
      const courseData = { title: newCourse.title };
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

      setNewCourse({ title: "", slug: "", instructor: "" });
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !selectedCourse) return;

    setUploading(true);
    try {
      const isImage = uploadType === "image";
      const signResponse = await fetch(`${API_BASE_URL}/admin/uploads/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          resourceType: isImage ? "image" : "video",
          courseId: selectedCourse.courseId,
          kind: isImage ? "image" : "video",
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
        const updateResponse = await fetch(
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

        if (!updateResponse.ok)
          throw new Error("Failed to update course thumbnail");
        fetchCourses();
      } else {
        const itemResponse = await fetch(
          `${API_BASE_URL}/admin/courses/${selectedCourse.courseId}/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              type: "video",
              title: uploadData.title,
              order: 100,
              storage: {
                provider: "cloudinary",
                resourceType: "video",
                publicId: cloudinaryData.public_id,
                url: cloudinaryData.secure_url,
              },
            }),
          }
        );

        if (!itemResponse.ok) throw new Error("Failed to save video info");
      }

      setUploadData({ title: "", file: null });
      setShowUpload(false);
      setSelectedCourse(null);
      showSuccess(isImage ? "Thumbnail uploaded!" : "Video uploaded!");
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
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
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {successMessage}
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

            {showForm && (
              <form
                onSubmit={handleCreateCourse}
                className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100"
              >
                <h3 className="font-semibold text-gray-800 mb-4">
                  Create New Course
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

            <div className="space-y-3">
              {courses.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No courses yet. Create your first course!</p>
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
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
                          {course.instructor || "No instructor"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setUploadType("image");
                          setShowUpload(true);
                        }}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium"
                      >
                        + Thumbnail
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
                        onClick={() =>
                          setModal({ isOpen: true, type: "delete", course })
                        }
                        className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded-lg text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
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
                Upload {uploadType === "image" ? "Thumbnail" : "Video"}
              </h3>
              <p className="text-gray-500 mb-6">
                Adding to "{selectedCourse.title}"
              </p>
              <form onSubmit={handleUpload}>
                {uploadType === "video" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, title: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Lecture 1: Introduction"
                      required
                    />
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {uploadType === "image" ? "Image" : "Video"} File *
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
                              : "MP4, MOV, AVI"}
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept={uploadType === "image" ? "image/*" : "video/*"}
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
                      (uploadType === "video" && !uploadData.title)
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
