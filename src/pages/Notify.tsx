// app/notify.tsx
import { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "@/components/layout/Navbar";
import Subnav from "@/components/layout/Subnav";
import BottomBar from "@/components/layout/BottomBar";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'system' | 'alert' | 'update';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Notify = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Substituir pela chamada real da API
        const response = await fetch('/api/notifications');
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError('Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Subnav title="Notificações" />
      
      <main className="flex-1 max-w-4xl mx-auto p-4 md:p-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Notificações</h1>
            {!loading && (
              <Badge variant="secondary" className="ml-2">
                {notifications.filter(n => !n.isRead).length} não lidas
              </Badge>
            )}
          </div>
          <Button 
            onClick={markAllAsRead} 
            variant="outline" 
            className="w-full md:w-auto"
            disabled={loading || notifications.length === 0}
          >
            Marcar todas como lidas
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando notificações...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            {error}
          </div>
        ) : (
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
                    notification.isRead 
                      ? "bg-muted/50 border-transparent"
                      : "bg-background border-primary/20 shadow-sm"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={notification.isRead ? "outline" : "default"}
                          className={cn(
                            "text-xs font-medium",
                            notification.type === 'alert' && "bg-red-500/20 text-red-900",
                            notification.type === 'update' && "bg-blue-500/20 text-blue-900",
                            notification.type === 'system' && "bg-gray-500/20 text-gray-900"
                          )}
                        >
                          {notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      <h3 className={cn(
                        "font-semibold mb-1",
                        !notification.isRead && "text-primary"
                      )}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>

                      {notification.action && (
                        <Button
                          variant="link"
                          className="h-auto p-0 mt-2 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                          }}
                        >
                          {notification.action.label}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-col items-end min-w-[120px]">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.date)}
                      </span>
                      <div className="mt-2">
                        {notification.isRead ? (
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
        )}
      </main>

      <BottomBar />
    </div>
  );
};

export default Notify;
