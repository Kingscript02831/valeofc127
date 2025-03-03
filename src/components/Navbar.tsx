
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, Search, PlusSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, username")
        .eq("id", user.id)
        .single();
        
      return { ...user, profile: data };
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
        
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="p-0 mr-4"
            onClick={() => navigate("/")}
          >
            <h1 className="text-xl font-bold">Vale OFC</h1>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/search")}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/posts/new")}
          >
            <PlusSquare className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notify")}
            >
              <Bell className="h-5 w-5" />
              {unreadCount ? (
                <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/perfil")}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profile?.avatar_url} />
              <AvatarFallback className="text-xs">
                {user?.profile?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
