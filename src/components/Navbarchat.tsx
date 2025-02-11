
import { MoreHorizontal, Search, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Navbarchat = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Navbar */}
      <nav className="bg-[#128C7E] border-b border-[#075E54] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">ZapVale</h1>
            </div>
            <div className="flex items-center">
              <button
                className="p-2 rounded-full hover:bg-[#075E54] transition-colors"
                aria-label="Menu"
              >
                <MoreHorizontal className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="bg-[#128C7E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <Link
                to="/conversas"
                className="py-4 px-1 border-b-2 border-white text-sm font-medium text-white"
              >
                Conversas
              </Link>
              <Link
                to="/status"
                className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-[#dcf8c6] hover:text-white hover:border-[#dcf8c6] transition-colors"
              >
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbarchat;
