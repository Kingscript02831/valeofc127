
import { Home, Bell, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-background py-1 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <Link
            to="/"
            className={`flex flex-col items-center p-1 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Início</span>
          </Link>

          <a
            href="/notifications"
            onClick={(e) => handleNavigation("/notifications", e)}
            className={`flex flex-col items-center p-1 ${isActive("/notifications") ? "text-primary" : "text-muted-foreground"}`}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">Notificações</span>
          </a>

          <Link
            to={session ? "/perfil" : "/login"}
            className={`flex flex-col items-center p-1 ${isActive("/perfil") || isActive("/login") ? "text-primary" : "text-muted-foreground"}`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">{session ? "Perfil" : "Login"}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
