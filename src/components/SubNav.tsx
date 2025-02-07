
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
    { 
      path: "/lojas", 
      label: "Lojas",
      subLinks: [
        { path: "/grupos", label: "Grupos" },
        { path: "/doacoes", label: "Doações" },
        { path: "/outros", label: "Outros" }
      ]
    }
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
            <div key={link.path} className="relative group">
              <Link
                to={link.path}
                className={`text-white font-medium hover:text-white/80 transition-colors ${
                  location.pathname === link.path ? "border-b-2 border-white" : ""
                }`}
              >
                {link.label}
              </Link>
              
              {link.subLinks && (
                <div className="absolute left-full top-0 hidden group-hover:block ml-1 w-48 bg-white rounded-md shadow-lg py-1">
                  {link.subLinks.map((subLink) => (
                    <Link
                      key={subLink.path}
                      to={subLink.path}
                      className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                        location.pathname === subLink.path
                          ? "bg-gray-50 text-primary"
                          : "text-gray-700"
                      }`}
                    >
                      {subLink.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
