
import { Home, Bell, User, Plus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useSiteConfig } from "@/hooks/useSiteConfig";

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
    if (!session && (path === "/notify" || path === "/products/new")) {
      toast.error("Você precisa fazer login para acessar esta área");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === "/perfil") {
      return location.pathname === "/perfil";
    }
    if (path === "/login") {
      return location.pathname === "/login";
    }
    return location.pathname === path;
  };

  const navStyle = {
    background: `linear-gradient(to right, ${config?.bottom_nav_primary_color || '#1A1F2C'}, ${config?.bottom_nav_secondary_color || '#D6BCFA'})`,
    borderTop: `1px solid ${config?.bottom_nav_primary_color || '#1A1F2C'}20`,
  };

  const getItemStyle = (active: boolean) => ({
    color: active ? (config?.bottom_nav_icon_color || '#FFFFFF') : (config?.bottom_nav_text_color || '#A0AEC0'),
    background: active ? `${config?.bottom_nav_primary_color || '#1A1F2C'}15` : 'transparent',
  });

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 shadow-lg transition-all duration-300 md:hidden z-50"
      style={navStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/"
            className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={getItemStyle(isActive("/"))}
          >
            <Home className="h-6 w-6" strokeWidth={2} />
          </Link>

          <button
            onClick={(e) => handleNavigation("/products/new", e)}
            className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              color: config?.bottom_nav_icon_color || '#FFFFFF',
              background: `${config?.primary_color || '#1A1F2C'}15`,
              opacity: session ? 1 : 0.5,
            }}
          >
            <Plus 
              className="h-6 w-6" 
              strokeWidth={2.5}
              style={{
                filter: `drop-shadow(0 2px 4px ${config?.primary_color || '#1A1F2C'}40)`
              }}
            />
          </button>

          <button
            onClick={(e) => handleNavigation("/notify", e)}
            className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105 relative"
            style={getItemStyle(isActive("/notify"))}
          >
            <Bell className="h-6 w-6" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <Link
            to={session ? "/perfil" : "/login"}
            className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={getItemStyle(isActive(session ? "/perfil" : "/login"))}
          >
            <User className="h-6 w-6" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
