
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Bell, MoreVertical, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "../components/ui/use-toast";
import type { Notification } from "../types/notifications";

const Notify = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive",
      });
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
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );

      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotifications(notifications.filter((notif) => notif.id !== id));

      toast({
        title: "Sucesso",
        description: "Notificação excluída com sucesso",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação",
        variant: "destructive",
      });
    }
  };

  const handleClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.type === "news" && notification.reference_id) {
      navigate(`/noticias/${notification.reference_id}`);
    } else if (notification.type === "event" && notification.reference_id) {
      navigate(`/eventos?id=${notification.reference_id}`);
    } else if (notification.type === "mention" && notification.reference_id) {
      // Handle mention notifications by redirecting to the post details page
      navigate(`/posts/${notification.reference_id}`);
      console.log("Navigating to post:", notification.reference_id);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'às' HH:mm", {
      locale: ptBR,
    });
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-muted/10 animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Você não tem notificações
            </h2>
            <p className="text-muted-foreground">
              Quando houver novas notificações, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden transition-colors hover:bg-muted/10 ${
                  !notification.read ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => handleClick(notification)}
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="text-base font-semibold">
                        {notification.title}
                      </CardTitle>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </div>
                    <CardDescription>
                      {formatDate(notification.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{notification.message}</p>
                  </CardContent>
                </div>
                <CardFooter className="flex justify-end bg-muted/5 pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notification.read && (
                        <DropdownMenuItem
                          onClick={() => markAsRead(notification.id)}
                        >
                          Marcar como lida
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => deleteNotification(notification.id)}
                        className="text-destructive"
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Notify;
