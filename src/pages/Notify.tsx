
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Trash2, UserPlus, UserCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import type { Notification } from "../types/notifications";

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
  const { data: notifications = [] } = useQuery({
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
      
      // Para cada notificação, buscar dados do sender se necessário
      const notificationsWithSenders = await Promise.all(
        data.map(async (notification) => {
          if (notification.reference_id && notification.message?.includes('começou a seguir você')) {
            // Buscar dados do usuário que seguiu
            const { data: senderData } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', notification.reference_id)
              .single();
            
            if (senderData) {
              // Verificar status de seguidor
              await checkFollowStatus(senderData.id);
              return { ...notification, sender: senderData };
            }
          }
          return notification;
        })
      );
      
      return notificationsWithSenders as Notification[];
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

  const handleFollowAction = (userId: string) => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    
    if (followStatuses[userId]) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          <p>Carregando...</p>
        </div>
        <BottomNav />
      </>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const followNotifications = notifications.filter(n => 
    n.message?.includes('começou a seguir você') && n.sender
  );

  return (
    <>
      <div className="min-h-screen bg-black text-white pb-20">
        <div className="max-w-3xl mx-auto p-4">
          {/* Header */}
          <div className="flex flex-col space-y-6 mb-8 pt-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Notificações</h1>
              <div className="bg-gray-800 rounded-full px-4 py-1 text-sm">
                {unreadCount} não lidas
              </div>
            </div>
            
            {/* Notifications Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-semibold">Notificações ativadas</p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
            
            {/* Mark All Read Button */}
            <Button 
              onClick={markAllAsRead}
              className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white rounded-lg py-3 px-4 h-12"
            >
              Marcar todas como lidas
            </Button>
          </div>
          
          {/* Notifications List */}
          <div className="space-y-4">
            {followNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Nenhuma notificação de seguidor encontrada
              </div>
            ) : (
              followNotifications.map((notification) => {
                const userId = notification.sender?.id;
                const isFollowing = userId ? followStatuses[userId] : false;
                
                return (
                  <div
                    key={notification.id}
                    className="flex items-center space-x-3 py-5 border-b border-gray-800"
                  >
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                      <AvatarImage 
                        src={notification.sender?.avatar_url || "/placeholder.svg"} 
                        alt={notification.sender?.username || 'User'} 
                      />
                      <AvatarFallback className="bg-gray-800">
                        {notification.sender?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col">
                        <span className="font-bold">
                          @{notification.sender?.username}
                        </span>
                        <span className="text-gray-300">
                          Começou a seguir Você.
                        </span>
                      </div>
                    </div>
                    
                    {/* Right Side - Time & Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        {format(new Date(notification.created_at), "dd MMM HH:mm", { locale: ptBR })}
                        {notification.read && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {userId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowAction(userId);
                            }}
                            disabled={followMutation.isPending || unfollowMutation.isPending}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Seguindo
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Seguir de volta
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-800 text-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Notify;
