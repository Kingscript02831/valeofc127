
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { supabase } from "../integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface StoryCircleProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
  isCurrentUser?: boolean;
}

const StoryCircle = ({ userId, username, avatarUrl, isCurrentUser = false }: StoryCircleProps) => {
  const navigate = useNavigate();
  const [hasUnviewedStories, setHasUnviewedStories] = useState(false);

  // Check if user has unviewed stories
  const { data: storiesData } = useQuery({
    queryKey: ["userStories", userId],
    queryFn: async () => {
      // Get all non-expired stories from the user
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
      
      // If it's the current user, no need to check views
      if (isCurrentUser) {
        setHasUnviewedStories(true);
        return { hasStories: true, stories };
      }
      
      // For other users, check if there are any unviewed stories
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return { hasStories: false, stories: [] };
      
      const storyIds = stories.map(story => story.id);
      
      const { data: views, error: viewsError } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("viewer_id", currentUser.user.id)
        .in("story_id", storyIds);
        
      if (viewsError) throw viewsError;
      
      // If number of views is less than number of stories, there are unviewed stories
      const hasUnviewed = views ? stories.length > views.length : true;
      setHasUnviewedStories(hasUnviewed);
      
      return { 
        hasStories: true, 
        hasUnviewedStories: hasUnviewed,
        stories 
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const handleClick = () => {
    if (isCurrentUser) {
      // Open modal to add story
      navigate("/story/new");
    } else if (storiesData?.hasStories) {
      // View user's stories
      navigate(`/story/view/${userId}`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-20 h-20 flex items-center justify-center cursor-pointer"
        onClick={handleClick}
      >
        {/* Gradient circle for unviewed stories */}
        <div 
          className={`absolute inset-0 rounded-full ${
            storiesData?.hasStories && hasUnviewedStories
              ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500" 
              : storiesData?.hasStories 
                ? "bg-gray-400 dark:bg-gray-600" 
                : "bg-transparent"
          }`}
        />

        {/* White inner circle */}
        <div className="absolute inset-1 bg-white dark:bg-black rounded-full" />

        {/* User avatar */}
        <Avatar className="w-18 h-18 relative border-2 border-white dark:border-gray-800">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={username} />
          ) : (
            <AvatarFallback>
              {username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>

        {/* "+" button for current user */}
        {isCurrentUser && (
          <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full border-2 border-white dark:border-gray-800 w-6 h-6 flex items-center justify-center">
            <span className="text-lg font-bold">+</span>
          </div>
        )}
      </div>

      {/* Username below */}
      <span className="mt-1 text-sm text-center font-medium truncate w-full">
        {isCurrentUser ? "Seu story" : username}
      </span>
    </div>
  );
};

export default StoryCircle;
