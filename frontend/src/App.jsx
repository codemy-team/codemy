import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CourseDetail from "./pages/CourseDetail";
import VideoPlayer from "./pages/VideoPlayer";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/video/:videoId" element={<VideoPlayer />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;