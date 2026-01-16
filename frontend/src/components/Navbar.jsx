import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <span>🎓</span>
          <span>Codemy</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full px-4 py-2 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-purple-400 transition-colors">
            Courses
          </Link>
          <a
            href="https://github.com/codemy-team/codemy"
            target="_blank"
            className="hover:text-purple-400 transition-colors"
          >
            GitHub
          </a>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full transition-colors">
            Login
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;