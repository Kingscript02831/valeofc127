
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import StoryCircle from "./StoryCircle";

const StoriesBar = () => {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      return data;
    },
  });

  // Get users that the current user follows
  const { data: followingUsers, isLoading } = useQuery({
    queryKey: ["storiesFollowing", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      // Get IDs of users that the current user follows
      const { data: followings } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);
      
      if (!followings || followings.length === 0) return [];
      
      const followingIds = followings.map(f => f.following_id);
      
      // Get profiles of followed users with active stories
      const { data: usersWithStories, error } = await supabase
        .from("profiles")
        .select(`
          id, 
          username, 
          avatar_url,
          stories!inner (id)
        `)
        .in("id", followingIds)
        .gt("stories.expires_at", new Date().toISOString());
      
      if (error) {
        console.error("Error fetching stories:", error);
        return [];
      }
      
      // Get some other followed users, even if they don't have stories
      const { data: otherUsers } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", followingIds)
        .not("id", "in", usersWithStories?.map(u => u.id) || [])
        .limit(5);  // Limit to some users to avoid overloading
      
      // Combine users with stories (first) and some without stories
      return [
        ...(usersWithStories || []),
        ...(otherUsers || [])
      ].slice(0, 10);  // Limit to 10 users total
    },
    enabled: !!currentUser?.id,
  });

  if (isLoading) {
    return (
      <div className="overflow-x-auto py-3 px-4">
        <div className="flex space-x-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-[62px] h-[62px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="w-12 h-2 mt-1 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-2 px-2 scrollbar-hide border-b border-gray-100 dark:border-gray-800">
      <div className="flex space-x-4 px-2">
        {/* Current user's circle always appears first */}
        {currentUser && (
          <StoryCircle
            userId={currentUser.id}
            username={currentUser.username || ""}
            avatarUrl={currentUser.avatar_url}
            isCurrentUser={true}
          />
        )}

        {/* Other followed users */}
        {followingUsers?.map((user) => (
          <StoryCircle
            key={user.id}
            userId={user.id}
            username={user.username || ""}
            avatarUrl={user.avatar_url}
          />
        ))}
      </div>
    </div>
  );
};

export default StoriesBar;
