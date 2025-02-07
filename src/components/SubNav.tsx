
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const SubNav = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);

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

  const navItems = [
    { name: "Notícias", path: "/" },
    { name: "Eventos", path: "/eventos" },
    { name: "Lugares", path: "/lugares" },
    { name: "Lojas", path: "/lojas" },
  ];

  return (
    <nav className="border-b shadow-sm"
         style={{ 
           backgroundColor: `${config.primary_color}10`,
           borderColor: `${config.primary_color}20`
         }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-8 h-12">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="inline-flex items-center px-4 h-full border-b-2 transition-all duration-200 hover:border-current text-lg font-medium"
              style={{ 
                color: config.primary_color,
                borderColor: 'transparent',
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
