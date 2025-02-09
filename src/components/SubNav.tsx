
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const SubNav = () => {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_configuration")
        .select("*")
        .single();
      return data;
    },
    placeholderData: {
      navbar_color: '#D6BCFA',
      primary_color: '#1A1F2C',
    } as SiteConfig,
    staleTime: Infinity, // Never mark the data as stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  
  const location = useLocation();

  const links = [
    { path: "/", label: "Notícias" },
    { path: "/eventos", label: "Eventos" },
    { path: "/lugares", label: "Lugares" },
    { path: "/lojas", label: "Lojas" },
  ];

  return (
    <nav 
      className="w-full border-b mt-16 shadow-sm"
      style={{ 
        background: `linear-gradient(to right, ${config?.navbar_color || '#D6BCFA'}, ${config?.primary_color || '#1A1F2C'})`,
        borderColor: `${config?.primary_color || '#1A1F2C'}20`
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
