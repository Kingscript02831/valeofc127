import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Tags from "@/components/Tags";

interface FollowNotificationProps {
  notification: {
    id: string;
    user_id: string;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    sender?: {
      username: string;
      avatar_url: string;
      id: string;
    };
  };
  currentUser: any;
  onUpdateRead: (id: string) => void;
}

const FollowNotification = ({ notification, currentUser, onUpdateRead }: FollowNotificationProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  
  useState(() => {
    const checkFollowStatus = async () => {
      if (!currentUser?.id || !notification.sender?.id) return;
      
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('following_id', notification.sender.id)
        .single();
      
      setIsFollowing(!!data);
    };
    
    checkFollowStatus();
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !notification.sender?.id) return;
      
      const { error } = await supabase
        .from('follows')
        .insert([
          { follower_id: currentUser.id, following_id: notification.sender.id }
        ]);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      setIsFollowing(true);
      queryClient.invalidateQueries({ queryKey: ['userFollowings'] });
      toast.success("Seguindo com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao seguir usuário");
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !notification.sender?.id) return;
      
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', notification.sender.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      setIsFollowing(false);
      queryClient.invalidateQueries({ queryKey: ['userFollowings'] });
      toast.success("Deixou de seguir com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao deixar de seguir usuário");
    }
  });

  const handleFollowAction = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onUpdateRead(notification.id);
    }
    
    if (notification.sender?.username) {
      navigate(`/perfil/${notification.sender.username}`);
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg bg-black text-white mb-2 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div 
          className="relative rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500"
          onClick={handleClick}
        >
          <Avatar className="h-12 w-12 border-2 border-black cursor-pointer">
            <AvatarImage 
              src={notification.sender?.avatar_url || undefined} 
              alt={notification.sender?.username || "Usuário"}
            />
            <AvatarFallback className="bg-gray-800 text-white">
              {notification.sender?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1" onClick={handleClick}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white">
                {notification.sender?.username || "Usuário"}
              </h3>
              <p className="text-gray-300 text-sm">
                <Tags content={notification.message} disableLinks={true} className="text-gray-300" />
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(notification.created_at)}
            </span>
          </div>
        </div>
        
        {notification.sender && notification.sender.id !== currentUser?.id && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleFollowAction();
            }}
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className={`rounded-full px-4 ${
              isFollowing 
                ? "bg-transparent text-white border-white hover:bg-gray-800" 
                : "bg-white text-black hover:bg-gray-200"
            }`}
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            {isFollowing ? "Seguindo" : "Seguir"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FollowNotification;
