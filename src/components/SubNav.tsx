
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SubNav = () => {
  const location = useLocation();
  const { data: config } = useQuery({
    queryKey: ['site_configuration'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_configuration')
        .select('*')
        .single();
      return data;
    }
  });

  if (!config) return null;

  const links = [
    { path: "/", label: "Notícias" },
    { path: "/eventos", label: "Eventos" },
    { path: "/lugares", label: "Lugares" },
    { path: "/lojas", label: "Lojas" }
  ];

  return (
    <nav 
      className="py-2 shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-white font-medium hover:text-white/80 transition-colors ${
                location.pathname === link.path ? "border-b-2 border-white" : ""
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
