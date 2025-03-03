
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { UserCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface FollowNotificationProps {
  username: string;
  avatarUrl: string;
  createdAt: string;
  userId: string;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  isProcessing: boolean;
}

const FollowNotification: React.FC<FollowNotificationProps> = ({
  username,
  avatarUrl,
  createdAt,
  userId,
  isFollowing,
  onFollowToggle,
  isProcessing,
}) => {
  const navigate = useNavigate();
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
    locale: ptBR,
  });
  
  const goToProfile = () => {
    navigate(`/perfil/${username}`);
  };

  return (
    <div className="flex items-center justify-between w-full bg-black text-white p-4 rounded-lg my-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div 
          className="relative cursor-pointer"
          onClick={goToProfile}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 -z-10" 
               style={{ padding: '2px', transform: 'scale(1.05)' }} />
          <img 
            src={avatarUrl || '/placeholder.svg'} 
            alt={username}
            className="w-14 h-14 rounded-full border-2 border-black object-cover"
          />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-end gap-1.5">
            <span 
              className="font-bold text-white cursor-pointer hover:underline"
              onClick={goToProfile}
            >
              {username}
            </span>
            <span className="text-white/80">
              começou a seguir você. {timeAgo}
            </span>
          </div>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "rounded-full px-6 py-1 h-10 font-semibold transition-all",
          isFollowing 
            ? "bg-transparent text-white border-gray-600 hover:bg-gray-800" 
            : "bg-white text-black hover:bg-gray-200"
        )}
        onClick={() => onFollowToggle(userId)}
        disabled={isProcessing}
      >
        {isFollowing ? (
          <>
            <UserCheck className="h-4 w-4 mr-1" />
            Seguindo
          </>
        ) : (
          "Seguir"
        )}
      </Button>
    </div>
  );
};

export default FollowNotification;
