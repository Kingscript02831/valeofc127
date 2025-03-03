
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ArrowLeft, Check, ExternalLink } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Notification } from "@/types/notifications";
import BottomNav from "@/components/BottomNav";

const Notify = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    switch (notification.type) {
      case "news":
        navigate(`/noticias/${notification.reference_id}`);
        break;
      case "event":
        navigate(`/eventos/${notification.reference_id}`);
        break;
      case "mention":
        navigate(`/posts/${notification.reference_id}`);
        break;
      default:
        // If system notification or other type with no specific page, just mark as read
        break;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "news":
        return <Badge className="bg-blue-500">Notícia</Badge>;
      case "event":
        return <Badge className="bg-green-500">Evento</Badge>;
      case "mention":
        return <Badge className="bg-purple-500">Menção</Badge>;
      default:
        return <Badge>Sistema</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md p-4 border-b border-border flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Notificações</h1>
      </header>

      <main className="container max-w-xl mx-auto pt-20 pb-24 px-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma notificação</h2>
            <p className="text-muted-foreground">
              Você não tem notificações para ver no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all border ${
                  !notification.read
                    ? "border-primary bg-primary/5"
                    : "bg-card"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {notification.type === "mention" && notification.sender ? (
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={notification.sender.avatar_url}
                          alt={notification.sender.username}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {notification.sender.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Bell className="h-5 w-5" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getNotificationBadge(notification.type)}
                          <span className="text-sm text-muted-foreground">
                            {notification.created_at && 
                              formatDistance(
                                new Date(notification.created_at),
                                new Date(),
                                { addSuffix: true, locale: ptBR }
                              )}
                          </span>
                        </div>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                        )}
                      </div>
                      
                      <h3 className="font-medium mb-1">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        {notification.reference_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNotificationClick(notification)}
                            className="text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver detalhes
                          </Button>
                        )}
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Notify;
