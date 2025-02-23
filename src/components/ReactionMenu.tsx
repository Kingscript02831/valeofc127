
import React from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { ThumbsUp, Heart, Smile, Frown, Angry } from "lucide-react";

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
}

const ReactionMenu: React.FC<ReactionMenuProps> = ({ isOpen, onSelect }) => {
  const { data: config } = useSiteConfig();

  if (!isOpen) return null;

  const reactions = [
    { type: 'like', icon: config?.like_emoji || <ThumbsUp className="w-5 h-5 text-blue-500" /> },
    { type: 'love', icon: config?.love_emoji || <Heart className="w-5 h-5 text-red-500" /> },
    { type: 'haha', icon: config?.haha_emoji || <Smile className="w-5 h-5 text-yellow-500" /> },
    { type: 'sad', icon: config?.sad_emoji || <Frown className="w-5 h-5 text-purple-500" /> },
    { type: 'angry', icon: config?.angry_emoji || <Angry className="w-5 h-5 text-orange-500" /> },
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2">
      {reactions.map(({ type, icon }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {typeof icon === 'string' ? (
            <img src={icon} alt={type} className="w-5 h-5 object-contain" />
          ) : (
            icon
          )}
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
