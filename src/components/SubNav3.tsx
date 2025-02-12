
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";

const SubNav3 = () => {
  const { data: config, isLoading } = useSiteConfig();
  const location = useLocation();

  const links = [
    { path: "/chat", label: "Conversas" },
    { path: "/status", label: "Status" },
    { path: "/reels", label: "Reels" },
  ];

  if (isLoading) {
    return (
      <nav className="w-full border-b mt-16 h-12 animate-pulse bg-gray-200" />
    );
  }

  return (
    <nav 
      className="w-full border-b mt-16 shadow-sm"
      style={{ 
        background: "#222222",
        borderColor: "#333333"
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-center space-x-8 py-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-white hover:opacity-80 transition-opacity ${
                location.pathname === link.path ? "border-b-2 border-blue-500" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav3;
