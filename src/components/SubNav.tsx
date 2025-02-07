
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const SubNav = () => {
  const location = useLocation();
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

  const links = [
    { href: "/", label: "Notícias" },
    { href: "/eventos", label: "Eventos" },
    { href: "/lugares", label: "Lugares" },
    { href: "/lojas", label: "Lojas" },
  ];

  if (!config) return null;

  return (
    <nav 
      className="border-b border-primary/20 shadow-sm"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-8 h-12">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "inline-flex items-center px-4 h-full text-white hover:bg-primary/20 transition-colors",
                location.pathname === link.href && "bg-primary/20"
              )}
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
