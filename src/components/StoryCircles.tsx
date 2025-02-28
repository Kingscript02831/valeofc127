
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StoryGroup } from "@/types/story";
import { useTheme } from "./ThemeProvider";

export default function StoryCircles() {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      // Obter histórias que ainda não expiraram
      const { data: stories, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          media_url,
          caption,
          created_at,
          expires_at,
          media_type,
          profiles:user_id (username, avatar_url)
        `)
        .filter('expires_at', 'gt', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar histórias por usuário
      const groupedStories: Record<string, StoryGroup> = {};
      
      stories?.forEach((story: any) => {
        const userId = story.user_id;
        
        if (!groupedStories[userId]) {
          groupedStories[userId] = {
            user_id: userId,
            username: story.profiles.username,
            avatar_url: story.profiles.avatar_url,
            stories: []
          };
        }
        
        groupedStories[userId].stories.push({
          id: story.id,
          user_id: story.user_id,
          media_url: story.media_url,
          caption: story.caption,
          created_at: story.created_at,
          expires_at: story.expires_at,
          media_type: story.media_type
        });
      });
      
      setStoryGroups(Object.values(groupedStories));
    } catch (error) {
      console.error('Erro ao buscar stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (userId: string) => {
    navigate(`/stories/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex overflow-x-auto gap-4 p-4 pb-2 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-14 h-3 mt-2 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 p-4 pb-2 no-scrollbar">
      {/* Botão para adicionar story */}
      <div className="flex flex-col items-center" onClick={() => navigate('/create-story')}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <span className="text-2xl">+</span>
        </div>
        <span className="text-xs mt-1 text-center">Seu story</span>
      </div>

      {/* Stories dos usuários */}
      {storyGroups.map((group) => (
        <div 
          key={group.user_id} 
          className="flex flex-col items-center" 
          onClick={() => handleStoryClick(group.user_id)}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[2px] flex items-center justify-center">
            <Avatar className="w-full h-full border-2 border-white dark:border-black">
              <AvatarImage src={group.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{group.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs mt-1 text-center truncate w-16">
            {group.username}
          </span>
        </div>
      ))}

      {storyGroups.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center w-full py-4">
          <p className="text-sm text-gray-500">Nenhum story encontrado</p>
        </div>
      )}
    </div>
  );
}
