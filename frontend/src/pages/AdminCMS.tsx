import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateQuiz, generateFlashcards } from "../services/gemini";
import { API_BASE_URL } from "../components/admin/constants";
import SuccessMessage from "../components/admin/SuccessMessage";
import DeleteModal from "../components/admin/DeleteModal";
import DeleteItemModal from "../components/admin/DeleteItemModal";
import AIModal from "../components/admin/AIModal";
import UploadModal from "../components/admin/UploadModal";
import ActiveCoursesSection from "../components/admin/ActiveCoursesSection";
import TrashSection from "../components/admin/TrashSection";
import type {
  Course,
  User,
  NewCourseData,
  UploadType,
  UploadData,
  ModalState,
  AIType,
  CourseItemsMap,
  LoadingItemsMap,
  ItemToDelete,
  QuizQuestion,
  FlashCard,
  CourseItem,
} from "../types";

const AdminCMS = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [deletedCourses, setDeletedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [newCourse, setNewCourse] = useState<NewCourseData>({
    title: "",
    slug: "",
    instructor: "",
    category: "Programming",
    level: "Beginner",
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<UploadType>("video");
  const [uploadData, setUploadData] = useState<UploadData>({
    title: "",
    file: null,
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "",
    course: null,
  });
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiType, setAiType] = useState<AIType>("quiz");
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<
    QuizQuestion[] | FlashCard[] | null
  >(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseItems, setCourseItems] = useState<CourseItemsMap>({});
  const [loadingItems, setLoadingItems] = useState<LoadingItemsMap>({});
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
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

  const getToken = (): string | null => localStorage.getItem("token");

  const showSuccess = (message: string): void => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const fetchCourses = async (): Promise<void> => {
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

  const fetchDeletedCourses = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/courses?includeDeleted=true`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await response.json();
      const deleted = (data.data || []).filter((c: Course) => c.deletedAt);
      setDeletedCourses(deleted);
    } catch (error) {
      console.error("Failed to fetch deleted courses:", error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const courseData: Partial<Course> = {
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create course";
      alert(errorMessage);
    }
  };

  const handleDeleteCourse = async (
    courseId: string,
    hard = false,
  ): Promise<void> => {
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
        hard ? "Course permanently deleted!" : "Course moved to trash!",
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleRestoreCourse = async (courseId: string): Promise<void> => {
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
        },
      );

      if (!response.ok) throw new Error("Failed to restore course");

      fetchCourses();
      fetchDeletedCourses();
      showSuccess("Course restored successfully!");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const fetchCourseItems = async (courseId: string): Promise<void> => {
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

  const handleToggleExpand = (courseId: string): void => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (!courseItems[courseId]) {
        fetchCourseItems(courseId);
      }
    }
  };

  const handleDeleteItem = async (): Promise<void> => {
    if (!itemToDelete) return;

    const { courseId, itemId } = itemToDelete;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/courses/${courseId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!response.ok) throw new Error("Failed to delete item");

      fetchCourseItems(courseId);
      showSuccess("Item deleted successfully!");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleUpload = async (e: React.FormEvent): Promise<void> => {
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
          },
        );
        fetchCourses();
      } else {
        const itemData: Partial<CourseItem> = {
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
          },
        );
        fetchCourseItems(selectedCourse.courseId);
      }

      setUploadData({ title: "", file: null });
      setShowUpload(false);
      setSelectedCourse(null);
      showSuccess(
        `${isImage ? "Thumbnail" : isMaterial ? "Material" : "Video"} uploaded!`,
      );
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAI = async (): Promise<void> => {
    if (!selectedCourse) return;
    setAiGenerating(true);
    setGeneratedContent(null);

    try {
      const content =
        aiType === "quiz"
          ? await generateQuiz(
              selectedCourse.title,
              selectedCourse.level || "Beginner",
              5,
            )
          : await generateFlashcards(
              selectedCourse.title,
              selectedCourse.level || "Beginner",
              10,
            );

      setGeneratedContent(content);
    } catch (error) {
      alert("Failed to generate content: " + (error as Error).message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveGeneratedContent = async (): Promise<void> => {
    if (!generatedContent || !selectedCourse) return;

    try {
      const itemData: Partial<CourseItem> = {
        type: aiType === "quiz" ? "quiz" : "flashcard",
        title: selectedCourse.title,
        order: 200,
      };

      if (aiType === "quiz") {
        itemData.questions = generatedContent as QuizQuestion[];
      } else {
        itemData.flashcards = generatedContent as FlashCard[];
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
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error?.message ||
            "Failed to save content",
        );
      }

      fetchCourseItems(selectedCourse.courseId);
      setShowAIModal(false);
      setGeneratedContent(null);
      setSelectedCourse(null);
      showSuccess(
        `${aiType === "quiz" ? "Quiz" : "Flashcards"} saved successfully!`,
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleLogout = (): void => {
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
          <SuccessMessage
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )}

        {/* Delete Modal */}
        {modal.isOpen && modal.type === "delete" && modal.course && (
          <DeleteModal
            course={modal.course}
            onClose={() => setModal({ isOpen: false, type: "", course: null })}
            onDelete={handleDeleteCourse}
          />
        )}

        {/* Delete Item Modal */}
        {itemToDelete && (
          <DeleteItemModal
            itemToDelete={itemToDelete}
            onClose={() => setItemToDelete(null)}
            onDelete={handleDeleteItem}
          />
        )}

        {/* AI Generation Modal */}
        {showAIModal && selectedCourse && (
          <AIModal
            selectedCourse={selectedCourse}
            aiType={aiType}
            aiGenerating={aiGenerating}
            generatedContent={generatedContent}
            onClose={() => {
              setShowAIModal(false);
              setGeneratedContent(null);
              setSelectedCourse(null);
            }}
            onTypeChange={(type) => {
              setAiType(type);
              setGeneratedContent(null);
            }}
            onGenerate={handleGenerateAI}
            onRegenerate={() => setGeneratedContent(null)}
            onSave={handleSaveGeneratedContent}
          />
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
          <ActiveCoursesSection
            courses={courses}
            showForm={showForm}
            newCourse={newCourse}
            expandedCourse={expandedCourse}
            courseItems={courseItems}
            loadingItems={loadingItems}
            onToggleForm={() => setShowForm(!showForm)}
            onCourseChange={setNewCourse}
            onCreateCourse={handleCreateCourse}
            onToggleExpand={handleToggleExpand}
            onAddThumbnail={(course) => {
              setSelectedCourse(course);
              setUploadType("image");
              setShowUpload(true);
            }}
            onAddVideo={(course) => {
              setSelectedCourse(course);
              setUploadType("video");
              setShowUpload(true);
            }}
            onAddMaterial={(course) => {
              setSelectedCourse(course);
              setUploadType("material");
              setShowUpload(true);
            }}
            onOpenAI={(course) => {
              setSelectedCourse(course);
              setShowAIModal(true);
            }}
            onDelete={(course) =>
              setModal({ isOpen: true, type: "delete", course })
            }
            onDeleteItem={(courseId, itemId, title, type) =>
              setItemToDelete({ courseId, itemId, title, type })
            }
          />
        )}

        {/* Trash */}
        {showDeleted && (
          <TrashSection
            deletedCourses={deletedCourses}
            onRestore={handleRestoreCourse}
            onDeletePermanently={(courseId) =>
              handleDeleteCourse(courseId, true)
            }
          />
        )}

        {/* Upload Modal */}
        {showUpload && selectedCourse && (
          <UploadModal
            selectedCourse={selectedCourse}
            uploadType={uploadType}
            uploadData={uploadData}
            uploading={uploading}
            onClose={() => {
              setShowUpload(false);
              setSelectedCourse(null);
              setUploadData({ title: "", file: null });
            }}
            onUploadDataChange={setUploadData}
            onSubmit={handleUpload}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
