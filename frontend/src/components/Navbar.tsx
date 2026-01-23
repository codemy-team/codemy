import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <span>🎓</span>
          <span>Codemy</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses or Instructors..."
              className="w-full px-4 py-2 pl-10 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-purple-400 transition-colors">
            Courses
          </Link>
          <a
            href="https://github.com/codemy-team/codemy"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-400 transition-colors"
          >
            GitHub
          </a>
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
