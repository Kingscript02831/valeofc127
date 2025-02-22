
import React from 'react';
import { ThumbsUp, Heart, Laugh, Frown, Angry } from 'lucide-react';

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
        className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
      >
        <ThumbsUp className="w-5 h-5" />
      </button>
      <button
        onClick={() => onSelect('love')}
        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
      >
        <Heart className="w-5 h-5" />
      </button>
      <button
        onClick={() => onSelect('haha')}
        className="p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
      >
        <Laugh className="w-5 h-5" />
      </button>
      <button
        onClick={() => onSelect('sad')}
        className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
      >
        <Frown className="w-5 h-5" />
      </button>
      <button
        onClick={() => onSelect('angry')}
        className="p-2 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
      >
        <Angry className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ReactionMenu;
