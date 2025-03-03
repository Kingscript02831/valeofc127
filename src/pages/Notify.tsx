import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, Clock, ChevronRight, Calendar, Newspaper, Trash2, UserCheck, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notifications";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getIconColor } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const Notify = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [isLoading, setIsLoading] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatuses, setFollowStatuses] = useState<Record<string, boolean>>({});

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
          setEnableNotifications(profile.notifications_enabled);
        }
      }
    };
    loadNotificationPreference();
  }, []);

  const toggleNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const newState = !enableNotifications;
      const { error } = await supabase
        .from('profiles')
        .update({ notifications_enabled: newState })
        .eq('id', session.user.id);

      if (error) throw error;

      setEnableNotifications(newState);
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

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      const notificationsWithSenders = await Promise.all(
        data.map(async (notification) => {
          if (notification.reference_id && notification.message?.includes('começou a seguir você')) {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', notification.reference_id)
              .single();
            
            if (senderData) {
              checkFollowStatus(senderData.id);
              return { ...notification, sender: senderData };
            }
          }
          return notification;
        })
      );
      
      return notificationsWithSenders;
    },
    enabled: !isLoading && !!currentUserId,
  });

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

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting notification:", error);
          throw error;
        }

        queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
          old?.filter((n) => n.id !== id)
        );

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
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", id);

        if (error) throw error;

        queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
          old?.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });

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
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("read", false)
          .eq("user_id", currentUserId);

        if (error) throw error;

        queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
          old?.map((n) => ({ ...n, read: true }))
        );

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
    }
  });

  const getNotificationIcon = (notification: Notification) => {
    if (notification.message?.includes('começou a seguir você') && notification.sender) {
      return (
        <div className="flex-shrink-0 mr-3">
          <Avatar className="h-10 w-10 border-2 border-gray-200">
            {notification.sender.avatar_url ? (
              <AvatarImage 
                src={notification.sender.avatar_url} 
                alt={notification.sender.username || 'usuário'} 
              />
            ) : (
              <AvatarFallback className="bg-primary/10">
                <User className="h-6 w-6" color={getIconColor(isLightMode)} />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      );
    }

    switch (notification.type) {
      case "event":
        return <Calendar className="w-6 h-6 mr-3" color={getIconColor(isLightMode)} />;
      case "news":
        return <Newspaper className="w-6 h-6 mr-3" color={getIconColor(isLightMode)} />;
      default:
        return <Bell className="w-6 h-6 mr-3" color={getIconColor(isLightMode)} />;
    }
  };

  const renderFollowButton = (notification: Notification) => {
    if (!notification.message?.includes('começou a seguir você') || !notification.sender) {
      return null;
    }

    const followerId = notification.sender.id;
    const isFollowing = followStatuses[followerId] || false;

    return (
      <div className="ml-auto pl-2">
        {isFollowing ? (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={(e) => {
              e.stopPropagation();
              unfollowMutation.mutate(followerId);
            }}
          >
            <UserCheck className="h-3.5 w-3.5 mr-1" />
            Seguindo
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              followMutation.mutate(followerId);
            }}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            Seguir
          </Button>
        )}
      </div>
    );
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
    <div className="pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold dark:text-white">Notificações</h1>
          <div className="flex items-center space-x-2">
            <Switch
              checked={enableNotifications}
              onCheckedChange={toggleNotifications}
            />
            <span className="text-sm dark:text-gray-300">
              {enableNotifications ? "Ativadas" : "Desativadas"}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            Sem notificações
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Você não tem nenhuma notificação no momento.
          </p>
        </div>
      ) : (
        <>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {notifications.filter((n) => !n.read).length} não lidas
            </span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => markAllAsReadMutation.mutate()}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Marcar todas como lidas
              </Button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                  !notification.read
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-white dark:bg-gray-800"
                }`}
                onClick={() => markAsReadMutation.mutate(notification.id)}
              >
                {getNotificationIcon(notification)}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {notification.message}
                  </p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400 ml-1">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
                {renderFollowButton(notification)}
                <div className="flex ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotificationMutation.mutate(notification.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <BottomNav />
    </div>
  );
};

export default Notify;
