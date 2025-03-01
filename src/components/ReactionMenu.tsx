
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { reactionsList } from '@/utils/emojisPosts';

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  currentReaction?: string | null;
}

const ReactionMenu = ({ isOpen, onSelect, currentReaction }: ReactionMenuProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className={cn(
      "absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-full bg-background/95 border border-border/40 shadow-lg transition-all duration-200",
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    )}>
      {reactionsList.map(({ emoji, type, label }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "flex flex-col items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all",
            "group relative",
            currentReaction === type && "bg-gray-100 dark:bg-gray-800"
          )}
        >
          <img 
            src={emoji} 
            alt={label}
            className="w-6 h-6 transition-transform group-hover:scale-125"
          />
          <span className="absolute -bottom-8 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;

