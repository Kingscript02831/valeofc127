
import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Notification } from "@/types/notifications";

interface NotifyEventosProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotifyEventos = ({ notification, onMarkAsRead }: NotifyEventosProps) => {
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
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Calendar className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              variant={notification.read ? "outline" : "default"}
              className="bg-green-500/10 text-green-700"
            >
              Evento
            </Badge>
            {!notification.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          <h3 className={cn(
            "text-sm font-medium mb-0.5",
            !notification.read && "text-primary"
          )}>
            {notification.publication_title || notification.title}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.publication_description || notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                Ver evento
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {notification.publication_date ? 
                format(new Date(notification.publication_date), "dd MMM yyyy", { locale: ptBR }) :
                format(new Date(notification.created_at), "dd MMM HH:mm", { locale: ptBR })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifyEventos;
