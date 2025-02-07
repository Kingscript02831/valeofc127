
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

  const navItems = [
    { path: "/", label: "Notícias" },
    { path: "/events", label: "Eventos" },
    { path: "/places", label: "Lugares" },
    { path: "/stores", label: "Lojas" },
  ];

  if (!config) return null;

  return (
    <nav className="shadow-md" style={{ background: config.navbar_color }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center space-x-8 py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-white font-medium hover:opacity-80 transition-opacity ${
                location.pathname === item.path ? "border-b-2 border-white" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
