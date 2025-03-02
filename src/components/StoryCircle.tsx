
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { supabase } from "../integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface StoryCircleProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
  isCurrentUser?: boolean;
  size?: "sm" | "md" | "lg";
}

const StoryCircle = ({ userId, username, avatarUrl, isCurrentUser = false, size = "md" }: StoryCircleProps) => {
  const navigate = useNavigate();
  const [hasUnviewedStories, setHasUnviewedStories] = useState(false);

  // Verificar se o usuário tem histórias não visualizadas
  const { data: storiesData } = useQuery({
    queryKey: ["userStories", userId],
    queryFn: async () => {
      // Buscar todas as histórias do usuário que não expiraram
      const { data: stories, error } = await supabase
        .from("stories")
        .select("id")
        .eq("user_id", userId)
        .gt("expires_at", new Date().toISOString());

      if (error) throw error;
      
      if (!stories || stories.length === 0) {
        setHasUnviewedStories(false);
        return { hasStories: false, stories: [] };
      }
      
      // Se for o usuário atual, não precisamos verificar visualizações
      if (isCurrentUser) {
        setHasUnviewedStories(true);
        return { hasStories: true, stories };
      }
      
      // Para outros usuários, verificar se há alguma história não visualizada pelo usuário atual
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return { hasStories: false, stories: [] };
      
      const storyIds = stories.map(story => story.id);
      
      const { data: views, error: viewsError } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("viewer_id", currentUser.user.id)
        .in("story_id", storyIds);
        
      if (viewsError) throw viewsError;
      
      // Se o número de visualizações for menor que o número de histórias,
      // então há histórias não visualizadas
      const hasUnviewed = views ? stories.length > views.length : true;
      setHasUnviewedStories(hasUnviewed);
      
      return { 
        hasStories: true, 
        hasUnviewedStories: hasUnviewed,
        stories 
      };
    },
    refetchInterval: 60000, // Refetch a cada minuto
  });

  const handleClick = () => {
    if (isCurrentUser) {
      // Abrir modal para adicionar story
      navigate("/story/new");
    } else if (storiesData?.hasStories) {
      // Ver stories do usuário
      navigate(`/story/view/${userId}`);
    }
  };

  // Tamanhos diferentes baseados na prop size
  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      avatar: "w-14 h-14",
      label: "text-xs",
    },
    md: {
      container: "w-20 h-20",
      avatar: "w-18 h-18",
      label: "text-sm",
    },
    lg: {
      container: "w-24 h-24",
      avatar: "w-22 h-22",
      label: "text-base",
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative ${sizeClasses[size].container} flex items-center justify-center cursor-pointer`}
        onClick={handleClick}
      >
        {/* Círculo gradiente ou círculo apagado */}
        <div 
          className={`absolute inset-0 rounded-full ${
            storiesData?.hasStories && hasUnviewedStories
              ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500" 
              : storiesData?.hasStories 
                ? "bg-gray-400 dark:bg-gray-600" 
                : "bg-transparent"
          }`}
        />

        {/* Círculo branco interno */}
        <div className="absolute inset-1 bg-white dark:bg-black rounded-full" />

        {/* Avatar do usuário */}
        <Avatar className={`${sizeClasses[size].avatar} relative border-2 border-white dark:border-gray-800`}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={username} />
          ) : (
            <AvatarFallback>
              {username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Botão "+" para usuário atual */}
        {isCurrentUser && (
          <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full border-2 border-white dark:border-gray-800 w-6 h-6 flex items-center justify-center">
            <span className="text-lg font-bold">+</span>
          </div>
        )}
      </div>

      {/* Nome de usuário abaixo */}
      <span className={`mt-1 ${sizeClasses[size].label} text-center font-medium truncate w-full`}>
        {isCurrentUser ? "Seu story" : username}
      </span>
    </div>
  );
};

export default StoryCircle;
