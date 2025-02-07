
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const SubNav = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    const { data } = await supabase
      .from("site_configuration")
      .select("*")
      .single();

    if (data) {
      setConfig(data);
    }
  };

  if (!config) return null;

  const links = [
    { path: "/", label: "Notícias" },
    { path: "/eventos", label: "Eventos" },
    { path: "/lugares", label: "Lugares" },
    { path: "/lojas", label: "Lojas" },
    { path: "/outros", label: "Outros" },
  ];

  return (
    <nav 
      className="shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 h-12">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.path 
                  ? 'border-b-2'
                  : 'hover:border-b-2 hover:border-opacity-50'
              }`}
              style={{ 
                color: config.text_color,
                borderColor: location.pathname === link.path ? config.text_color : 'transparent'
              }}
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
