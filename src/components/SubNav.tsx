
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";

const SubNav = () => {
  const { data: config, isLoading } = useSiteConfig();
  const location = useLocation();

  const links = [
    { path: "/", label: "Notícias" },
    { path: "/eventos", label: "Eventos" },
    { path: "/lugares", label: "Lugares" },
    { path: "/lojas", label: "Lojas" },
  ];

  if (isLoading) {
    return (
      <nav className="w-full fixed top-16 z-40 h-12 animate-pulse bg-gray-200" />
    );
  }

  return (
    <nav 
      className="w-full fixed top-16 z-40 shadow-sm border-b"
      style={{ 
        background: `linear-gradient(to right, ${config?.navbar_color || '#000000'}, ${config?.primary_color || '#000000'})`,
        borderColor: `${config?.primary_color || '#000000'}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-center space-x-8 py-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-white hover:opacity-80 transition-opacity ${
                location.pathname === link.path ? "border-b-2" : ""
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

export default SubNav;
