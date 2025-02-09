
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    placeholderData: (previousData) => previousData, // Use previous data while refetching
  });
  
  const location = useLocation();

  // Return a loading state instead of null
  if (!config) {
    return (
      <nav className="w-full border-b animate-pulse bg-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-center space-x-8 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-6 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  const links = [
    { path: "/", label: "Notícias" },
    { path: "/eventos", label: "Eventos" },
    { path: "/lugares", label: "Lugares" },
    { path: "/lojas", label: "Lojas" },
  ];

  return (
    <nav 
      className="w-full border-b"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        borderColor: `${config.primary_color}20`
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
