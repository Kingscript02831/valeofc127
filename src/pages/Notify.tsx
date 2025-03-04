
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check, Trash2 } from "lucide-react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import BottomNav from "../components/BottomNav";
import { Notification } from "../types/notifications";
import { useTheme } from "../components/ThemeProvider";
import { toast } from "sonner";

const Notify: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notification.id);
          
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      if (notification.type === 'follow' && notification.sender?.username) {
        navigate(`/perfil/${notification.sender.username}`);
      } else if (notification.type === 'news' && notification.reference_id) {
        navigate(`/noticias/${notification.reference_id}`);
      } else if (notification.type === 'event' && notification.reference_id) {
        navigate(`/eventos/${notification.reference_id}`);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notificação removida");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Erro ao remover notificação");
    }
  };

  const getNotificationText = (notification: Notification) => {
    if (notification.type === 'follow' && notification.sender?.username) {
      return (
        <span>
          <span className="text-blue-500 font-medium">@{notification.sender.username}</span> começou a seguir você.
        </span>
      );
    }
    return notification.message;
  };

  return (
    <div className={`min-h-screen pb-16 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="sticky top-0 z-10 p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-inherit">
        <div className="flex items-center">
          <Bell className="h-6 w-6 mr-2 text-blue-500" />
          <h1 className="text-xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
              {unreadCount} não lidas
            </Badge>
          )}
        </div>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <Check className="h-4 w-4 mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <p className="text-center py-10">Carregando notificações...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Bell className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="py-1">
                Notificações ativadas
              </Badge>
            </div>
            
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`
                  cursor-pointer 
                  max-w-[94%] 
                  mx-auto
                  transition-colors 
                  hover:bg-gray-100 dark:hover:bg-gray-900
                  ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}
                `}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center">
                      <Badge variant="outline" className={`
                        mr-2 ${notification.type === 'follow' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                        notification.type === 'news' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
                      `}>
                        {notification.type === 'follow' ? 'Seguidor' : 
                         notification.type === 'news' ? 'Notícia' : 
                         notification.type === 'event' ? 'Evento' : 'Sistema'}
                      </Badge>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 ml-2" />
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CardDescription className="text-xs">
                      {format(new Date(notification.created_at), "dd MMM HH:mm", { locale: ptBR })}
                    </CardDescription>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-sm">{getNotificationText(notification)}</p>
                </CardContent>
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
