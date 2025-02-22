
import React from 'react';
import { Heart, ThumbsUp, Laugh, Frown, Angry } from 'lucide-react';

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
}

const ReactionMenu: React.FC<ReactionMenuProps> = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 p-2 bg-background/95 backdrop-blur-sm rounded-full shadow-lg border border-border flex gap-2 animate-in fade-in slide-in-from-bottom-5">
      <button
        onClick={() => onSelect('like')}
        className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
      >
        <ThumbsUp className="w-6 h-6 text-blue-500 border-2 border-blue-500 rounded-full p-1" />
      </button>
      <button
        onClick={() => onSelect('love')}
        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors group"
      >
        <Heart className="w-6 h-6 text-red-500 border-2 border-red-500 rounded-full p-1" />
      </button>
      <button
        onClick={() => onSelect('haha')}
        className="p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors group"
      >
        <Laugh className="w-6 h-6 text-yellow-500 border-2 border-yellow-500 rounded-full p-1" />
      </button>
      <button
        onClick={() => onSelect('sad')}
        className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors group"
      >
        <Frown className="w-6 h-6 text-purple-500 border-2 border-purple-500 rounded-full p-1" />
      </button>
      <button
        onClick={() => onSelect('angry')}
        className="p-2 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors group"
      >
        <Angry className="w-6 h-6 text-orange-500 border-2 border-orange-500 rounded-full p-1" />
      </button>
    </div>
  );
};

export default ReactionMenu;
