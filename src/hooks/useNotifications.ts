
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notifications";
import { toast } from "sonner";

export function useNotifications() {
  const queryClient = useQueryClient();
  
  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  // Fetch notifications
  const { 
    data: notifications, 
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ["notifications", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      console.log("Fetching notifications for user:", currentUser.id);
      
      // First try to fetch with sender profile info
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          title,
          message,
          type,
          reference_id,
          read,
          created_at,
          publication_title,
          publication_description,
          publication_date,
          user_id,
          sender_id,
          sender:sender_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }

      console.log("Notifications fetched:", data);
      return data as Notification[];
    },
    enabled: !!currentUser,
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log("Marking notification as read:", notificationId);
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["rawNotifications"] });
    },
    onError: () => {
      toast.error("Erro ao marcar notificação como lida");
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      
      console.log("Marking all notifications as read for user:", currentUser.id);
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", currentUser.id)
        .eq("read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["rawNotifications"] });
      toast.success("Todas as notificações foram marcadas como lidas");
    },
    onError: () => {
      toast.error("Erro ao marcar todas notificações como lidas");
    },
  });

  // Get unread count
  const unreadCount = notifications?.filter(
    notification => !notification.read
  ).length || 0;

  return {
    notifications,
    isLoading,
    isError,
    error,
    unreadCount,
    currentUser,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate()
  };
}
