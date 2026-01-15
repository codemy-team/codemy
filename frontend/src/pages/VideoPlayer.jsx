import { useParams, Link } from "react-router-dom";

const VideoPlayer = () => {
  const { videoId } = useParams();

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <Link to="/" className="text-blue-500 hover:underline mb-6 block">
        ← Back to Courses
      </Link>
      
      <div className="aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;