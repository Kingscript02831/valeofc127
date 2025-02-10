
import { Home, Bell, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { supabase } from "../integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!session && path === "/notifications") {
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
    background: `linear-gradient(to right, ${config?.bottom_nav_primary_color || '#1A1F2C'}, ${config?.bottom_nav_secondary_color || '#D6BCFA'})`,
  };

  const iconColor = config?.bottom_nav_icon_color || '#FFFFFF';
  const textColor = config?.bottom_nav_text_color || '#FFFFFF';

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 py-1 md:hidden" style={navStyle}>
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <Link
            to="/"
            className={`flex flex-col items-center p-1`}
            style={{ color: isActive("/") ? iconColor : textColor }}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Início</span>
          </Link>

          <a
            href="/notifications"
            onClick={(e) => handleNavigation("/notifications", e)}
            className={`flex flex-col items-center p-1`}
            style={{ color: isActive("/notifications") ? iconColor : textColor }}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">Notificações</span>
          </a>

          <Link
            to={session ? "/perfil" : "/login"}
            className={`flex flex-col items-center p-1`}
            style={{ color: isActive("/perfil") || isActive("/login") ? iconColor : textColor }}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Eu</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
