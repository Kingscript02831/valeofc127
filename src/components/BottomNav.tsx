
import { Home, Bell, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();
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

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      if (!session) return 0;
      
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!session,
    refetchInterval: 30000,
  });

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!session && path === "/notify") {
      toast.error("Você precisa fazer login para acessar esta área");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navStyle = {
    background: `linear-gradient(to right, ${config?.bottom_nav_primary_color || '#1A1F2C'}90, ${config?.bottom_nav_secondary_color || '#D6BCFA'}90)`,
    borderTop: `1px solid ${config?.bottom_nav_primary_color}20 || '#1A1F2C20'`,
  };

  const getItemStyle = (active: boolean) => ({
    color: active ? config?.bottom_nav_icon_color : config?.bottom_nav_text_color,
    background: active ? `${config?.bottom_nav_primary_color}15` : 'transparent',
  });

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 py-2 backdrop-blur-md shadow-lg transition-all duration-300 md:hidden"
      style={navStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <Link
            to="/"
            className="flex flex-col items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={getItemStyle(isActive("/"))}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Início</span>
          </Link>

          <button
            onClick={(e) => handleNavigation("/notify", e)}
            className="flex flex-col items-center p-2 rounded-xl transition-all duration-300 hover:scale-105 relative"
            style={getItemStyle(isActive("/notify"))}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
            <span className="text-xs mt-1 font-medium">Notificações</span>
          </button>

          <Link
            to={session ? "/perfil" : "/login"}
            className="flex flex-col items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={getItemStyle(isActive("/perfil") || isActive("/login"))}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Eu</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
