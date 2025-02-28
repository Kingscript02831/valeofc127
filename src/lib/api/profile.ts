
import { supabase } from "@/integrations/supabase/client";
import { Profile, Follower } from "@/types/database";
import { createFollowNotification } from "./notifications";

/**
 * Fetches a user profile by ID
 * @param userId - The ID of the user to fetch
 * @returns The user profile data
 */
export async function getUserProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Profile not found");
  
  return data;
}

/**
 * Updates the current user's profile
 * @param profileData - Partial profile data to update
 * @returns The updated profile data
 */
export async function updateProfile(profileData: Partial<Profile>): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Checks if the current user is following another user
 * @param userId - The ID of the user to check
 * @returns Boolean indicating if the current user is following the specified user
 */
export async function isFollowing(userId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("followers")
    .select("*")
    .eq("follower_id", user.id)
    .eq("followed_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Gets the follower count for a user
 * @param userId - The ID of the user to get followers for
 * @returns The count of followers
 */
export async function getFollowerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("followed_id", userId);

  if (error) throw error;
  return count || 0;
}

/**
 * Gets the following count for a user
 * @param userId - The ID of the user to get following for
 * @returns The count of users being followed
 */
export async function getFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  if (error) throw error;
  return count || 0;
}

/**
 * Follows a user
 * @param userId - The ID of the user to follow
 */
export async function followUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  // Check if already following
  const isAlreadyFollowing = await isFollowing(userId);
  if (isAlreadyFollowing) return;

  // Create follower relationship
  const { error } = await supabase
    .from("followers")
    .insert({
      follower_id: user.id,
      followed_id: userId
    });

  if (error) throw error;
  
  // Create notification for the followed user
  await createFollowNotification(userId);
}

/**
 * Unfollows a user
 * @param userId - The ID of the user to unfollow
 */
export async function unfollowUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", user.id)
    .eq("followed_id", userId);

  if (error) throw error;
}

/**
 * Gets the followers of a user
 * @param userId - The ID of the user to get followers for
 * @returns Array of followers with their profile data
 */
export async function getFollowers(userId: string): Promise<Follower[]> {
  const { data, error } = await supabase
    .from("followers")
    .select(`
      *,
      follower:follower_id(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("followed_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Gets the users that a user is following
 * @param userId - The ID of the user to get following for
 * @returns Array of following relationships with profile data
 */
export async function getFollowing(userId: string): Promise<Follower[]> {
  const { data, error } = await supabase
    .from("followers")
    .select(`
      *,
      followed:followed_id(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
