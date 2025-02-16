
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { Newspaper, Calendar, MapPin, Store, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const SubNav = () => {
  const { data: config, isLoading, isError } = useSiteConfig();
  const location = useLocation();
  const navigate = useNavigate();
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

  const links = [
    { path: "/", label: "Notícias", icon: Newspaper },
    { path: "/eventos", label: "Eventos", icon: Calendar },
    { path: "/lugares", label: "Lugares", icon: MapPin },
    { path: "/lojas", label: "Lojas", icon: Store },
  ];

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Você precisa fazer login para acessar esta área");
      navigate("/login");
      return;
    }
    navigate("/notify");
  };

  if (isLoading) {
    return (
      <nav className="w-full border-b mt-16 h-12 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full border-b mt-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-center space-x-16 py-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:opacity-80 transition-opacity p-2"
                  title={link.label}
                >
                  <Icon size={24} />
                </Link>
              );
            })}
            <button
              onClick={handleNotificationClick}
              className="text-white hover:opacity-80 transition-opacity p-2 relative"
              title="Notificações"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full border-b mt-16 shadow-sm"
      style={{ 
        background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
        borderColor: `${config?.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-center space-x-16 py-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-white hover:opacity-80 transition-opacity p-2 ${
                  location.pathname === link.path ? "border-b-2" : ""
                }`}
                title={link.label}
              >
                <Icon size={24} />
              </Link>
            );
          })}
          <button
            onClick={handleNotificationClick}
            className={`text-white hover:opacity-80 transition-opacity p-2 relative ${
              location.pathname === "/notify" ? "border-b-2" : ""
            }`}
            title="Notificações"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
