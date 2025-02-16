
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { Newspaper, Calendar, MapPin, Store } from "lucide-react";

const SubNav = () => {
  const { data: config, isLoading, isError } = useSiteConfig();
  const location = useLocation();

  const links = [
    { path: "/", label: "Notícias", icon: Newspaper },
    { path: "/eventos", label: "Eventos", icon: Calendar },
    { path: "/lugares", label: "Lugares", icon: MapPin },
    { path: "/lojas", label: "Lojas", icon: Store },
  ];

  if (isLoading) {
    return (
      <nav className="w-full border-b mt-16 h-12 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full border-b mt-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-center space-x-8 py-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:opacity-80 transition-opacity"
                  title={link.label}
                >
                  <Icon size={24} />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full border-b mt-16 shadow-sm"
      style={{ 
        background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
        borderColor: `${config?.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-center space-x-8 py-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-white hover:opacity-80 transition-opacity ${
                  location.pathname === link.path ? "border-b-2" : ""
                }`}
                title={link.label}
              >
                <Icon size={24} />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
