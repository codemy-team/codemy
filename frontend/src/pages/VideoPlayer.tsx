import { useLocation, useNavigate } from "react-router-dom";

const VideoPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoUrl, title, pdfUrl, isPdf } = location.state || {};

  // Handle no content case
  if (!videoUrl && !pdfUrl) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline mb-6 block"
        >
          ← Back to Course
        </button>
        <p>Content not found</p>
      </div>
    );
  }

  // Render PDF preview
  if (isPdf && pdfUrl) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline mb-6 block"
        >
          ← Back to Course
        </button>

        <h1 className="text-2xl font-bold mb-4">{title}</h1>

        {/* PDF Viewer using Native Iframe */}
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden relative"
          style={{ height: "80vh" }}
        >
          <iframe
            src={pdfUrl}
            title={title}
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </div>

        {/* Download link / External open */}
        <div className="mt-4 text-center">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Open PDF in New Tab
          </a>
        </div>
      </div>
    );
  }

  // Render Video player
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:underline mb-6 block"
      >
        ← Back to Course
      </button>

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video src={videoUrl} controls autoPlay className="w-full h-full">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;
