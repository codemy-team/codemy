import { useLocation, Link } from "react-router-dom";

const VideoPlayer = () => {
  const location = useLocation();
  const { videoUrl, title } = location.state || {};

  if (!videoUrl) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-6">
        <Link to="/" className="text-blue-500 hover:underline mb-6 block">
          ← Back to Courses
        </Link>
        <p>Video not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <Link to="/" className="text-blue-500 hover:underline mb-6 block">
        ← Back to Courses
      </Link>

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;