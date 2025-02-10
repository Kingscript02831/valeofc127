
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, Clock, ChevronRight, Calendar, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'news' | 'event';
  reference_id?: string;
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

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      // Atualiza o cache local
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      // Se houver um reference_id, navegue para a página apropriada
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

      // Atualiza o cache local
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
        return <Calendar className="h-5 w-5" />;
      case "news":
        return <Newspaper className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Notificações</h1>
          <Badge variant="secondary" className="ml-2">
            {notifications.filter(n => !n.read).length} não lidas
          </Badge>
        </div>
        <Button 
          onClick={markAllAsRead} 
          variant="outline" 
          className="w-full md:w-auto"
        >
          Marcar todas como lidas
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma notificação encontrada
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "group flex flex-col p-4 rounded-lg border transition-all",
                "hover:shadow-md cursor-pointer",
                notification.read 
                  ? "bg-muted/50 border-transparent"
                  : "bg-background border-primary/20 shadow-sm"
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={notification.read ? "outline" : "default"}
                      className={cn(
                        "text-xs font-medium",
                        notification.type === 'event' && "bg-blue-500/20 text-blue-900",
                        notification.type === 'news' && "bg-green-500/20 text-green-900"
                      )}
                    >
                      {notification.type === 'event' ? 'Evento' : 'Notícia'}
                    </Badge>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>

                  <h3 className={cn(
                    "font-semibold mb-1",
                    !notification.read && "text-primary"
                  )}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>

                  {notification.reference_id && (
                    <Button
                      variant="link"
                      className="h-auto p-0 mt-2 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      Ver detalhes
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-col items-end min-w-[120px]">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  <div className="mt-2">
                    {notification.read ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notify;
