
import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface StoryCircleProps {
  imageUrl: string;
  username: string;
  isNew?: boolean;
  isOwn?: boolean;
  isViewed?: boolean;
  onClick?: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({
  imageUrl,
  username,
  isNew = false,
  isOwn = false,
  isViewed = false,
  onClick
}) => {
  return (
    <div className="flex flex-col items-center space-y-1" onClick={onClick}>
      <div 
        className={cn(
          "relative rounded-full",
          isNew && !isViewed ? "p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500" : 
          isNew && isViewed ? "p-[2px] bg-gray-500 dark:bg-gray-600" : 
          isOwn ? "p-[2px] bg-gray-300 dark:bg-gray-700" : ""
        )}
      >
        <div className="p-[2px] rounded-full bg-black">
          <Avatar className="h-16 w-16 border-2 border-black cursor-pointer hover:opacity-90 transition-opacity">
            <AvatarImage src={imageUrl} alt={username} className="object-cover" />
            <AvatarFallback className="bg-gray-800 text-white">
              {username?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          
          {isOwn && (
            <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-0.5 border-2 border-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs text-center truncate w-20 text-white">{username}</span>
    </div>
  );
};

export default StoryCircle;
