import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, Clock, ChevronRight, Calendar, Newspaper, Trash2, UserCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import type { Notification } from "@/types/notifications";

const Notify = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
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
          setNotificationsEnabled(profile.notifications_enabled);
        }
      }
    };
    loadNotificationPreference();
  }, []);

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
          if (notification.reference_id && notification.type === 'system' && notification.message?.includes('começou a seguir você')) {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', notification.reference_id)
              .single();
            
            if (senderData) {
              let formattedMessage = notification.message;
              if (senderData.username) {
                formattedMessage = `@${senderData.username} começou a seguir você.`;
              }
              
              checkFollowStatus(senderData.id);
              return { 
                ...notification, 
                sender: senderData,
                message: formattedMessage 
              };
            }
          }
          return notification;
        })
      );
      
      return notificationsWithSenders as Notification[];
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
      
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', currentUserId)
        .single();
      
      const username = currentUserProfile?.username || currentUserId;
      
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            title: 'Novo seguidor',
            message: `@${username} começou a seguir você.`,
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
  };

  const markAsRead = async (id: string) => {
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
        } else if (notification.sender?.username) {
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

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "news":
        return <Newspaper className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma notificação encontrada
            </div>
          ) : (
            notifications.map((notification) => {
              const isFollowNotification = notification.message?.includes('começou a seguir você');
              const userId = notification.sender?.id;
              const isFollowing = userId ? followStatuses[userId] : false;
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group flex flex-col p-3 rounded-lg border transition-all",
                    "hover:shadow-sm cursor-pointer",
                    notification.read 
                      ? "bg-muted/50 border-transparent"
                      : "bg-background border-primary/10"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {notification.sender?.avatar_url ? (
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={notification.sender.avatar_url} alt={notification.sender.username || 'User'} />
                        <AvatarFallback>
                          {notification.sender.full_name?.charAt(0).toUpperCase() || notification.sender.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge
                          variant={notification.read ? "outline" : "default"}
                          className={cn(
                            "text-xs font-medium",
                            notification.type === 'event' && "bg-blue-500/10 text-blue-700",
                            notification.type === 'news' && "bg-green-500/10 text-green-700",
                            notification.type === 'system' && "bg-purple-500/10 text-purple-700"
                          )}
                        >
                          {notification.type === 'event' ? 'Evento' : 
                           notification.type === 'news' ? 'Notícia' : 
                           isFollowNotification ? 'Seguidor' : 'Sistema'}
                        </Badge>
                        {notification.publication_category && (
                          <Badge variant="outline" className="text-xs">
                            {notification.publication_category}
                          </Badge>
                        )}
                        {!notification.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      {isFollowNotification ? (
                        <h3 className={cn(
                          "text-sm font-medium mb-0.5",
                          !notification.read && "text-primary"
                        )}>
                          {notification.message}
                        </h3>
                      ) : (
                        <h3 className={cn(
                          "text-sm font-medium mb-0.5",
                          !notification.read && "text-primary"
                        )}>
                          {notification.publication_title || notification.title}
                        </h3>
                      )}
                      
                      {notification.publication_description && (
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                          {notification.publication_description}
                        </p>
                      )}
                      
                      {!isFollowNotification && notification.message && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {notification.message}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {notification.reference_id && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              Ver detalhes
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                          
                          {isFollowNotification && userId && (
                            <Button
                              variant={isFollowing ? "outline" : "default"}
                              size="sm"
                              className={`h-8 ${isFollowing ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'text-white'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollowAction(userId);
                              }}
                              disabled={followMutation.isPending || unfollowMutation.isPending}
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                  Seguindo
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                                  Seguir de volta
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(notification.created_at), "dd MMM HH:mm", { locale: ptBR })}
                          </span>
                          {notification.read ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-yellow-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Notify;
