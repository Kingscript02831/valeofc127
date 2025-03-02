import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import StoryCircle from "./StoryCircle";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const StoriesBar = () => {
  const navigate = useNavigate();
  
  // Busca o usuário atual
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
      
      return data ? { ...data, id: user.id } : null;
    },
  });

  // Busca perfis que o usuário está seguindo e que têm stories ativos
  const { data: followingWithStories, isLoading } = useQuery({
    queryKey: ["storiesFollowing", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      // Busca quem o usuário atual segue
      const { data: following, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      if (followingError) throw followingError;
      
      if (!following?.length) return [];
      
      const followingIds = following.map(f => f.following_id);
      
      // Busca perfis das pessoas que o usuário segue
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", followingIds);
        
      if (profilesError) throw profilesError;
      
      if (!profiles?.length) return [];
      
      // Para cada perfil, verifica se tem stories ativos
      const profilesWithStoryStatus = await Promise.all(profiles.map(async (profile) => {
        const { count, error } = await supabase
          .from("stories")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id)
          .gt("expires_at", new Date().toISOString());
          
        if (error) throw error;
        
        return {
          ...profile,
          has_active_stories: count > 0
        };
      }));
      
      // Ordena: primeiro os que têm stories ativos, depois os outros
      return profilesWithStoryStatus.sort((a, b) => {
        if (a.has_active_stories && !b.has_active_stories) return -1;
        if (!a.has_active_stories && b.has_active_stories) return 1;
        return 0;
      });
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

  // Se não tiver usuário logado ou seguindo ninguém, não mostra a barra
  if (!currentUser || (!followingWithStories?.length && !currentUser)) {
    return null;
  }

  return (
    <div className="overflow-x-auto py-2 px-2 scrollbar-hide">
      <div className="flex space-x-4 px-2">
        {/* Current user's circle always appears first */}
        {currentUser && (
          <div className="flex flex-col items-center">
            <div 
              className="relative cursor-pointer"
              onClick={() => navigate("/story/new")}
            >
              <div className="w-[62px] h-[62px] bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-300">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-xs mt-1 text-center">Seu story</p>
          </div>
        )}

        {/* Current user's active stories */}
        {currentUser && (
          <StoryCircle
            key={`user-${currentUser.id}`}
            userId={currentUser.id}
            username="Seu story"
            avatarUrl={currentUser.avatar_url}
            onClick={() => navigate(`/story/view/${currentUser.id}`)}
          />
        )}

        {/* Other followed users */}
        {followingWithStories?.map((profile) => (
          <StoryCircle
            key={profile.id}
            userId={profile.id}
            username={profile.username || ""}
            avatarUrl={profile.avatar_url}
            hasStories={profile.has_active_stories}
            onClick={() => navigate(`/story/view/${profile.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default StoriesBar;
