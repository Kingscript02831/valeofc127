
import { Home, User, Plus, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: config, isLoading } = useSiteConfig();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Você precisa fazer login para acessar esta área");
      navigate("/login");
      return;
    }
    navigate(path);
  };
  
  // Renderiza um esqueleto de carregamento se estiver carregando
  if (isLoading) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 animate-pulse bg-gray-200 md:hidden" />
    );
  }

  const navStyle = {
    background: config?.bottom_nav_primary_color || "#000000e6",
    borderTop: `1px solid ${config?.bottom_nav_secondary_color || "rgba(255, 255, 255, 0.1)"}`,
  };

  const getItemStyle = (active: boolean) => ({
    color: active 
      ? config?.bottom_nav_icon_color || "#ffffff" 
      : config?.bottom_nav_text_color || "#ffffff80",
    background: active 
      ? `${config?.bottom_nav_secondary_color}15` || "rgba(255, 255, 255, 0.1)" 
      : "transparent",
  });

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 shadow-lg transition-all duration-300 md:hidden"
      style={navStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/"
            className="flex items-center p-2 rounded-xl"
            style={getItemStyle(location.pathname === "/")}
          >
            <Home className="h-6 w-6" strokeWidth={2} />
          </Link>

          <Link
            to="/search"
            className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={getItemStyle(location.pathname === "/search")}
          >
            <Search className="h-6 w-6" strokeWidth={2} />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  color: config?.bottom_nav_icon_color || "#ffffff",
                  background: config?.bottom_nav_secondary_color || "rgba(255, 255, 255, 0.1)",
                  opacity: session ? 1 : 0.5,
                }}
              >
                <Plus 
                  className="h-6 w-6" 
                  strokeWidth={2.5}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              className="mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => handleNavigation("/products/new", e)}
              >
                Adicionar Produto
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => handleNavigation("/posts/new", e)}
              >
                Criar Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to={session ? "/perfil" : "/login"}
            className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={getItemStyle(location.pathname === "/perfil" || location.pathname === "/login")}
          >
            <User className="h-6 w-6" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
