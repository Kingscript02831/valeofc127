
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";

interface StoryCircleProps {
  userId: string;
  username: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  hasStories?: boolean;
  onClick?: () => void;
}

const StoryCircle = ({ 
  userId, 
  username, 
  avatarUrl, 
  isCurrentUser = false,
  hasStories = false,
  onClick
}: StoryCircleProps) => {
  // Check if user has active stories
  const { data: hasActiveStories } = useQuery({
    queryKey: ["userHasStories", userId],
    queryFn: async () => {
      if (!userId) return false;
      
      // Skip query if we already know the status
      if (hasStories !== undefined) return hasStories;
      
      const { count, error } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gt("expires_at", new Date().toISOString());
        
      if (error) {
        console.error("Error checking stories:", error);
        return false;
      }
      
      return count > 0;
    },
    // Don't refetch unnecessarily
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !isCurrentUser && hasStories === undefined
  });

  const displayName = username ? (username.length > 10 ? username.substring(0, 8) + "..." : username) : "Usuário";
  
  // Determine if we should show the story ring
  const showStoryRing = useMemo(() => {
    if (hasStories !== undefined) return hasStories;
    return hasActiveStories;
  }, [hasStories, hasActiveStories]);

  return (
    <div 
      className="flex flex-col items-center cursor-pointer" 
      onClick={onClick}
    >
      <div className={cn(
        "p-[2px] rounded-full",
        showStoryRing 
          ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" 
          : "bg-transparent"
      )}>
        <Avatar className="w-[58px] h-[58px] border-2 border-background">
          {avatarUrl ? (
            <AvatarImage 
              src={avatarUrl} 
              alt={displayName}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="text-lg">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      <span className="text-xs mt-1 text-center max-w-[62px] truncate">
        {displayName}
      </span>
    </div>
  );
};

export default StoryCircle;
