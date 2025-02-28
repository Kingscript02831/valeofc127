
import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Notification } from "@/types/notifications";

interface NotifySeguidoresProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string | null;
  isFollowing: boolean;
  isFollowMutating: boolean;
  isUnfollowMutating: boolean;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

const NotifySeguidores = ({
  notification,
  onMarkAsRead,
  onDelete,
  currentUserId,
  isFollowing,
  isFollowMutating,
  isUnfollowMutating,
  onFollow,
  onUnfollow
}: NotifySeguidoresProps) => {
  const userId = notification.sender?.id;

  const handleFollowAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId || !userId) return;
    
    if (isFollowing) {
      onUnfollow(userId);
    } else {
      onFollow(userId);
    }
  };

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
        {notification.sender?.avatar_url ? (
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src={notification.sender.avatar_url} alt={notification.sender.username || 'User'} />
            <AvatarFallback>
              {notification.sender.full_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              variant={notification.read ? "outline" : "default"}
              className="bg-purple-500/10 text-purple-700"
            >
              Seguidor
            </Badge>
            {!notification.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          <h3 className={cn(
            "text-sm font-medium mb-0.5",
            !notification.read && "text-primary"
          )}>
            {notification.sender?.username ? (
              <span className="font-semibold">@{notification.sender.username}</span>
            ) : ''}
            {' '}
            começou a seguir você.
          </h3>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {userId && (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className={`h-8 ${isFollowing ? 'text-muted-foreground' : 'text-white'}`}
                  onClick={handleFollowAction}
                  disabled={isFollowMutating || isUnfollowMutating}
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
            
            <div className="text-xs text-muted-foreground">
              {format(new Date(notification.created_at), "dd MMM HH:mm", { locale: ptBR })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifySeguidores;
