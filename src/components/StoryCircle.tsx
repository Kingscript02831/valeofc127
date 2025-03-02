
import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface StoryCircleProps {
  imageUrl: string;
  username: string;
  isNew?: boolean;
  isOwn?: boolean;
  onClick?: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({
  imageUrl,
  username,
  isNew = false,
  isOwn = false,
  onClick
}) => {
  return (
    <div className="flex flex-col items-center space-y-1" onClick={onClick}>
      <div 
        className={cn(
          "relative rounded-full",
          isNew ? "p-[3px] bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500" : "p-[3px] bg-gray-700"
        )}
      >
        <Avatar className="h-16 w-16 border-2 border-white dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={imageUrl} alt={username} />
          <AvatarFallback>
            {username?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        
        {isOwn && (
          <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        )}
      </div>
      <span className="text-xs text-center truncate w-20">{username}</span>
    </div>
  );
};

export default StoryCircle;
