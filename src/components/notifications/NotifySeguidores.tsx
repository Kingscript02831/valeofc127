
import { User, UserPlus, UserMinus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  currentUserId,
  isFollowing,
  isFollowMutating,
  isUnfollowMutating,
  onFollow,
  onUnfollow
}: NotifySeguidoresProps) => {
  const navigate = useNavigate();
  const [followerData, setFollowerData] = useState<any>(null);
  const senderId = notification.sender?.id || notification.reference_id;

  useEffect(() => {
    const fetchFollowerData = async () => {
      if (!senderId) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", senderId)
          .single();
        
        if (error) throw error;
        setFollowerData(data);
      } catch (error) {
        console.error("Error fetching follower data:", error);
      }
    };
    
    if (senderId && !notification.sender) {
      fetchFollowerData();
    }
  }, [senderId, notification.sender]);

  const handleFollow = () => {
    if (senderId) {
      onFollow(senderId);
    }
  };

  const handleUnfollow = () => {
    if (senderId) {
      onUnfollow(senderId);
    }
  };
  
  const user = notification.sender || followerData;
  
  if (!user) {
    return null;
  }

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
        <Avatar 
          className="h-8 w-8 border cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/perfil/${user.username}`);
          }}
        >
          <AvatarImage 
            src={user.avatar_url || '/placeholder.svg'} 
            alt={user.username} 
          />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              variant={notification.read ? "outline" : "default"}
              className="bg-pink-500/10 text-pink-700"
            >
              Seguidor
            </Badge>
            {!notification.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">
              {user.full_name}
            </span>
            <span className="text-muted-foreground text-xs">
              @{user.username}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground my-1">
            {notification.message || "começou a seguir você"}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {senderId !== currentUserId && (
                isFollowing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfollow();
                    }}
                    disabled={isUnfollowMutating}
                  >
                    <UserMinus className="mr-1 h-3 w-3" />
                    Deixar de seguir
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow();
                    }}
                    disabled={isFollowMutating}
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Seguir
                  </Button>
                )
              )}
              
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/perfil/${user.username}`);
                }}
              >
                Ver perfil
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
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
