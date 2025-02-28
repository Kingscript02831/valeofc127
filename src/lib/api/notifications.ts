
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/database";

/**
 * Fetches all notifications for the current user
 * @returns Array of notification objects
 */
export async function getNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      follower:follower_id(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Marks a notification as read
 * @param notificationId - ID of the notification to mark as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

/**
 * Marks all notifications as read for the current user
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) throw error;
}

/**
 * Creates a follow notification
 * @param followedId - ID of the user being followed
 */
export async function createFollowNotification(followedId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Get user profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profile not found");

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: followedId,
      title: "Novo seguidor",
      message: " começou a seguir você",
      type: "follow",
      read: false,
      follower_id: user.id
    });

  if (error) throw error;
}

/**
 * Deletes a notification
 * @param notificationId - ID of the notification to delete
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;
}
