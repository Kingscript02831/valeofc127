import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, Clock, ChevronRight, Calendar, Newspaper, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import BottomNav from "@/components/BottomNav";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'news' | 'event';
  reference_id?: string;
  publication_title?: string;
  publication_description?: string;
  publication_category?: string;
  publication_date?: string;
}

const Notify = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

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
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !isLoading,
  });

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local cache
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.filter((n) => n.id !== id)
      );

      toast.success("Notificação excluída com sucesso");
    } catch (error: any) {
      toast.error("Erro ao excluir notificação");
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

      // Navigate if there's a reference_id
      const notification = notifications.find(n => n.id === id);
      if (notification?.reference_id) {
        if (notification.type === 'event') {
          navigate(`/eventos`);
        } else if (notification.type === 'news') {
          navigate(`/`);
        }
      }
    } catch (error: any) {
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      if (error) throw error;

      // Update local cache
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => ({ ...n, read: true }))
      );

      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (error: any) {
      toast.error("Erro ao marcar notificações como lidas");
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
        <Navbar />
        <SubNav />
        <div className="flex items-center justify-center min-h-screen">
          <p>Carregando...</p>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <SubNav />
      <div className="max-w-3xl mx-auto p-4 md:p-6 mb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Notificações</h1>
            <Badge variant="secondary" className="ml-2">
              {notifications.filter(n => !n.read).length} não lidas
            </Badge>
          </div>
          <Button 
            onClick={markAllAsRead} 
            variant="outline" 
            size="sm"
            className="w-full md:w-auto"
          >
            Marcar todas como lidas
          </Button>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma notificação encontrada
            </div>
          ) : (
            notifications.map((notification) => (
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
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge
                        variant={notification.read ? "outline" : "default"}
                        className={cn(
                          "text-xs font-medium",
                          notification.type === 'event' && "bg-blue-500/10 text-blue-700",
                          notification.type === 'news' && "bg-green-500/10 text-green-700"
                        )}
                      >
                        {notification.type === 'event' ? 'Evento' : 'Notícia'}
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

                    <h3 className={cn(
                      "text-sm font-medium mb-0.5 truncate",
                      !notification.read && "text-primary"
                    )}>
                      {notification.publication_title || notification.title}
                    </h3>
                    
                    {notification.publication_description && (
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                        {notification.publication_description}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {notification.message}
                    </p>

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
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Notify;
