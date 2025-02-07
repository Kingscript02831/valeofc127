
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const menuItems = [
    { path: "/grupos", label: "Grupos" },
    { path: "/doacao", label: "Doação" },
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
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
                  style={{ color: config.text_color }}
                >
                  <Menu size={24} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                style={{
                  backgroundColor: config.navbar_color,
                  border: `1px solid ${config.primary_color}40`
                }}
              >
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.path}>
                    <Link
                      to={item.path}
                      className="w-full px-2 py-1.5 text-sm"
                      style={{ color: config.text_color }}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
      </div>
    </nav>
  );
};

export default SubNav;
