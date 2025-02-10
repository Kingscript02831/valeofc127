// app/notify.tsx
import { useState } from "react";
import { Bell, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nova Atualização Disponível',
      message: 'Versão 2.1 inclui melhorias de desempenho e novos recursos',
      date: '2024-03-15T14:30:00',
      isRead: false,
      type: 'update',
      action: {
        label: 'Ver Detalhes',
        onClick: () => console.log('Ver detalhes da atualização')
      }
    },
    {
      id: '2',
      title: 'Alerta de Segurança',
      message: 'Atividade suspeita detectada em sua conta. Por favor verifique.',
      date: '2024-03-14T09:15:00',
      isRead: true,
      type: 'alert'
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      isRead: true
    })));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Notificações</h1>
          <Badge variant="secondary" className="ml-2">
            {notifications.filter(n => !n.isRead).length} não lidas
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
    </div>
  );
};

export default Notify;
