
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
  ];

  return (
    <nav 
      className="py-2 px-4 shadow-sm"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-center space-x-8">
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
    </nav>
  );
};

export default SubNav;
