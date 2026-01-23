// Upload Modal Component
import type { Course, UploadType, UploadData } from "../../types";

interface UploadModalProps {
  selectedCourse: Course;
  uploadType: UploadType;
  uploadData: UploadData;
  uploading: boolean;
  onClose: () => void;
  onUploadDataChange: (data: UploadData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UploadModal = ({
  selectedCourse,
  uploadType,
  uploadData,
  uploading,
  onClose,
  onUploadDataChange,
  onSubmit,
}: UploadModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
        onClick={onClose}
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
        <p className="text-gray-500 mb-6">Adding to "{selectedCourse.title}"</p>
        <form onSubmit={onSubmit}>
          {uploadType !== "image" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) =>
                  onUploadDataChange({ ...uploadData, title: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={
                  uploadType === "material" ? "Course Syllabus" : "Lecture 1"
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
                  onUploadDataChange({
                    ...uploadData,
                    file: e.target.files?.[0] || null,
                  })
                }
                required
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
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
  );
};

export default UploadModal;
