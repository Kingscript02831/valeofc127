import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import BottomNav from "@/components/BottomNav";
import { formatDate } from "@/lib/utils";
import { Profile } from "@/types/profile";

interface NotificationWithProfile {
  id: string;
  follower_id: string;
  created_at: string;
  read: boolean;
  follower: Profile;
}

export default function NotifySeguidor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");
      
      console.log("Fetching notifications for user:", session.user.id);

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          follower:follower_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      console.log("Fetched notifications:", data);
      return data as NotificationWithProfile[];
    },
  });

  if (error) {
    console.error("Error in notifications query:", error);
  }

  const followMutation = useMutation({
    mutationFn: async (followerId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("follows")
        .insert([
          { follower_id: session.user.id, following_id: followerId }
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Seguindo",
        description: "Você começou a seguir este usuário",
      });
    },
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
        <p className={theme === 'light' ? 'text-black' : 'text-white'}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Notificações</h1>
      </div>

      <div className="pt-16 pb-20">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-gray-500">Nenhuma notificação ainda</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={notification.follower.avatar_url || "/placeholder.svg"}
                    alt={`Avatar de ${notification.follower.username}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">
                      {notification.follower.username} começou a seguir você
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => followMutation.mutate(notification.follower.id)}
                  variant="outline"
                  className="ml-4"
                >
                  Seguir
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
