
import { useState } from "react";
import { Trash2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotifySeguidores from "./NotifySeguidores";
import NotifyEventos from "./NotifyEventos";
import NotifyNoticias from "./NotifyNoticias";
import NotifySystem from "./NotifySystem";
import type { Notification } from "@/types/notifications";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string | null;
  followStatuses: Record<string, boolean>;
  followMutation: any;
  unfollowMutation: any;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
  onDelete,
  currentUserId,
  followStatuses,
  followMutation,
  unfollowMutation
}: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma notificação encontrada
      </div>
    );
  }

  const handleFollow = (userId: string) => {
    followMutation.mutate(userId);
  };

  const handleUnfollow = (userId: string) => {
    unfollowMutation.mutate(userId);
  };

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const isFollowNotification = notification.message?.includes('começou a seguir você');
        const userId = notification.sender?.id;
        const isFollowing = userId ? followStatuses[userId] : false;
        
        // Renderizar diferentes componentes com base no tipo de notificação
        if (isFollowNotification && notification.sender) {
          return (
            <div key={notification.id} className="relative group">
              <NotifySeguidores
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                currentUserId={currentUserId}
                isFollowing={isFollowing}
                isFollowMutating={followMutation.isPending}
                isUnfollowMutating={unfollowMutation.isPending}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <span className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                {notification.read ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500" />
                )}
              </span>
            </div>
          );
        } else if (notification.type === 'event') {
          return (
            <div key={notification.id} className="relative group">
              <NotifyEventos
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <span className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                {notification.read ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500" />
                )}
              </span>
            </div>
          );
        } else if (notification.type === 'news') {
          return (
            <div key={notification.id} className="relative group">
              <NotifyNoticias
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <span className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                {notification.read ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500" />
                )}
              </span>
            </div>
          );
        } else {
          return (
            <div key={notification.id} className="relative group">
              <NotifySystem
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <span className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                {notification.read ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500" />
                )}
              </span>
            </div>
          );
        }
      })}
    </div>
  );
};

export default NotificationList;
