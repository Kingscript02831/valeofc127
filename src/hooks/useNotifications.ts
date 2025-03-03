import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notifications";

interface UseNotificationsProps {
  userId: string | undefined;
}

const useNotifications = ({ userId }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: rawNotifications, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }

      return data as Notification[];
    },
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (rawNotifications) {
      setNotifications(rawNotifications);
      const unread = rawNotifications.filter((notification) => !notification.read).length;
      setUnreadCount(unread);
    }
  }, [rawNotifications]);

  const updateNotificationReadStatus = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error updating notification status:", error);
      } else {
        // Optimistically update the state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          )
        );
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    updateNotificationReadStatus,
  };
};

export default useNotifications;
