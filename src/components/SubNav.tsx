
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";

const SubNav = () => {
  const { data: config, isLoading, isError } = useSiteConfig();
  const location = useLocation();

  const links = [
    { path: "/", label: "Notícias" },
    { path: "/eventos", label: "Eventos" },
    { path: "/lugares", label: "Lugares" },
    { path: "/lojas", label: "Lojas" },
  ];

  if (isLoading) {
    return (
      <nav className="w-full border-b mt-16 h-12 animate-pulse bg-gray-200 backdrop-blur-lg" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full border-b mt-16 bg-gray-800 backdrop-blur-lg">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-center space-x-8 py-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:opacity-80 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full border-b mt-16 shadow-sm backdrop-blur-md transition-all duration-300"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}90, ${config.primary_color}90)`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-center space-x-8 py-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105 ${
                location.pathname === link.path 
                  ? "font-medium shadow-sm" 
                  : "hover:opacity-80"
              }`}
              style={{
                color: config.text_color,
                background: location.pathname === link.path 
                  ? `${config.primary_color}15`
                  : 'transparent',
              }}
            >
              {link.label}
              {location.pathname === link.path && (
                <span 
                  className="absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-all duration-300"
                  style={{
                    background: config.text_color
                  }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
