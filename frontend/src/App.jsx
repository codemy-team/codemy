import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CourseDetail from "./pages/CourseDetail";
import VideoPlayer from "./pages/VideoPlayer";
import Quiz from "./pages/Quiz";
import Login from "./pages/Login";
import AdminCMS from "./pages/AdminCMS";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/video/:videoId" element={<VideoPlayer />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminCMS />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
