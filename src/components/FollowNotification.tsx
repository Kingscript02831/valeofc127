
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from '@supabase/auth-js';
import { Notification } from "@/types/notifications";

// Import formatDate from utils
const formatDate = (date: string | number | Date): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInMinutes < 1) {
    return 'Agora';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else if (diffInWeeks < 5) {
    return `${diffInWeeks} sem`;
  } else {
    return postDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }
};

interface FollowNotificationProps {
  notification: Notification;
  currentUser: User | null;
  onUpdateRead: (notificationId: string) => void;
}

const FollowNotification: React.FC<FollowNotificationProps> = ({
  notification,
  currentUser,
  onUpdateRead
}) => {
  const navigate = useNavigate();
  
  console.log("Rendering notification:", notification);

  const handleClick = async () => {
    if (!notification.read) {
      onUpdateRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'follow' && notification.sender?.username) {
      navigate(`/perfil/${notification.sender.username}`);
    } else if (notification.type === 'news' && notification.reference_id) {
      navigate(`/noticias/${notification.reference_id}`);
    } else if (notification.type === 'event' && notification.reference_id) {
      navigate(`/eventos/${notification.reference_id}`);
    } else if (notification.type === 'system') {
      // System notifications don't navigate
      console.log("System notification clicked, no navigation");
    }
  };

  // Determine the correct avatar URL
  const avatarUrl = notification.sender?.avatar_url || '';

  return (
    <Card 
      className={`mb-3 transition-all hover:shadow-md ${!notification.read ? 'border-blue-400 dark:border-blue-500' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4 cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={notification.sender?.username || 'User'}
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground text-sm font-medium">
                {notification.sender?.username?.charAt(0).toUpperCase() || 'N'}
              </div>
            )}
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {notification.title}
                {!notification.read && (
                  <Badge className="ml-2 bg-blue-500" variant="default">Nova</Badge>
                )}
              </h4>
              <span className="text-xs text-muted-foreground">
                {formatDate(notification.created_at)}
              </span>
            </div>
            
            <p className="text-sm mt-1">
              {notification.type === 'follow' && notification.sender ? (
                <span>
                  <strong>{notification.sender.username}</strong> {notification.message}
                </span>
              ) : (
                <span>{notification.message}</span>
              )}
            </p>
            
            {notification.publication_title && (
              <div className="mt-2 p-2 bg-muted rounded-sm">
                <p className="text-sm font-medium">{notification.publication_title}</p>
                {notification.publication_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.publication_description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowNotification;
