
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

  // Buscar usuários que o usuário atual segue
  const { data: followingUsers, isLoading } = useQuery({
    queryKey: ["storiesFollowing", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      // Buscar IDs dos usuários que o usuário atual segue
      const { data: followings } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);
      
      if (!followings || followings.length === 0) return [];
      
      const followingIds = followings.map(f => f.following_id);
      
      // Buscar perfis dos usuários seguidos que têm stories ativos
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
      
      // Buscar outros usuários seguidos, mesmo que não tenham stories
      const { data: otherUsers } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", followingIds)
        .not("id", "in", usersWithStories?.map(u => u.id) || [])
        .limit(5);  // Limitar a alguns usuários para não sobrecarregar
      
      // Combinar usuários com stories (primeiro) e alguns sem stories
      return [
        ...(usersWithStories || []),
        ...(otherUsers || [])
      ].slice(0, 10);  // Limitar a 10 usuários no total
    },
    enabled: !!currentUser?.id,
  });

  if (isLoading) {
    return (
      <div className="overflow-x-auto py-4 px-4">
        <div className="flex space-x-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="w-16 h-4 mt-1 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-4 px-4 scrollbar-hide">
      <div className="flex space-x-4">
        {/* Círculo do usuário atual sempre aparece primeiro */}
        {currentUser && (
          <StoryCircle
            userId={currentUser.id}
            username={currentUser.username || ""}
            avatarUrl={currentUser.avatar_url}
            isCurrentUser={true}
          />
        )}

        {/* Outros usuários seguidos */}
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
