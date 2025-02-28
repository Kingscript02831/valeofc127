
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import NotificationList from "@/components/notifications/NotificationList";
import type { Notification } from "@/types/notifications";

const Notify = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatuses, setFollowStatuses] = useState<Record<string, boolean>>({});

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      } else {
        navigate("/login");
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  // Load notification preference
  useEffect(() => {
    const loadNotificationPreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('notifications_enabled')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setNotificationsEnabled(profile.notifications_enabled);
        }
      }
    };
    loadNotificationPreference();
  }, []);

  // Toggle notifications
  const toggleNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const newState = !notificationsEnabled;
      const { error } = await supabase
        .from('profiles')
        .update({ notifications_enabled: newState })
        .eq('id', session.user.id);

      if (error) throw error;

      setNotificationsEnabled(newState);
      toast.success(
        newState 
          ? "Notificações ativadas com sucesso" 
          : "Notificações desativadas com sucesso",
        {
          position: "top-center",
          style: { marginTop: "64px" }
        }
      );
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast.error("Erro ao alterar estado das notificações", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    }
  };

  // Check for authentication status
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  // Fetch notifications
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:reference_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // For each user who might have sent a follow notification, check if we're following them
      if (data) {
        for (const notification of data) {
          if (notification.message?.includes('começou a seguir você') && notification.sender) {
            const senderId = notification.sender.id;
            if (senderId) {
              checkFollowStatus(senderId);
            }
          }
        }
      }
      
      return data as Notification[];
    },
    enabled: !isLoading && !!currentUserId,
  });

  // Check if we're following a specific user
  const checkFollowStatus = async (userId: string) => {
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();
      
      if (!error) {
        setFollowStatuses(prev => ({
          ...prev,
          [userId]: true
        }));
      } else {
        setFollowStatuses(prev => ({
          ...prev,
          [userId]: false
        }));
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  // Follow a user
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUserId) {
        throw new Error("Not authenticated");
      }
      
      const { data, error } = await supabase
        .from('follows')
        .insert([
          { follower_id: currentUserId, following_id: userId }
        ]);
        
      if (error) throw error;
      
      // Add notification to the other user about being followed back
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            title: 'Novo seguidor',
            message: `@${currentUserId} começou a seguir você.`,
            type: 'system',
            reference_id: currentUserId
          }
        ]);
        
      return data;
    },
    onSuccess: (_, userId) => {
      setFollowStatuses(prev => ({
        ...prev,
        [userId]: true
      }));
      toast.success("Seguindo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["followStats"] });
    },
    onError: (error) => {
      console.error("Error following user:", error);
      toast.error("Erro ao seguir usuário");
    }
  });

  // Unfollow a user
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUserId) {
        throw new Error("Not authenticated");
      }
      
      const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      setFollowStatuses(prev => ({
        ...prev,
        [userId]: false
      }));
      toast.success("Deixou de seguir com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["followStats"] });
    },
    onError: (error) => {
      console.error("Error unfollowing user:", error);
      toast.error("Erro ao deixar de seguir usuário");
    }
  });

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting notification:", error);
        throw error;
      }

      // Update local cache
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.filter((n) => n.id !== id)
      );

      // Also invalidate the unreadNotifications query
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });

      toast.success("Notificação excluída com sucesso", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    } catch (error: any) {
      console.error("Error in deleteNotification:", error);
      toast.error("Erro ao excluir notificação", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      // Update local cache
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      // Also invalidate the unreadNotifications query
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });

      // Navigate if there's a reference_id
      const notification = notifications.find(n => n.id === id);
      if (notification?.reference_id) {
        if (notification.type === 'event') {
          navigate(`/eventos`);
        } else if (notification.type === 'news') {
          navigate(`/`);
        } else if (notification.sender) {
          navigate(`/perfil/${notification.sender.username}`);
        }
      }
    } catch (error: any) {
      toast.error("Erro ao marcar notificação como lida", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false)
        .eq("user_id", currentUserId);

      if (error) throw error;

      // Update local cache
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => ({ ...n, read: true }))
      );

      // Also invalidate the unreadNotifications query
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });

      toast.success("Todas as notificações foram marcadas como lidas", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    } catch (error: any) {
      toast.error("Erro ao marcar notificações como lidas", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <p>Carregando...</p>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto p-4 md:p-6 mb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Notificações</h1>
            <Badge variant="secondary" className="ml-2">
              {notifications.filter(n => !n.read).length} não lidas
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
                aria-label="Toggle notifications"
              />
              <span className="text-sm text-muted-foreground">
                {notificationsEnabled ? "Notificações ativadas" : "Notificações desativadas"}
              </span>
            </div>
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap"
            >
              Marcar todas como lidas
            </Button>
          </div>
        </div>

        <NotificationList 
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
          currentUserId={currentUserId}
          followStatuses={followStatuses}
          followMutation={followMutation}
          unfollowMutation={unfollowMutation}
        />
      </div>
      <BottomNav />
    </>
  );
};

export default Notify;
