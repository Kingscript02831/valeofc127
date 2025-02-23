
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
    <div 
      className={cn(
        "fixed transform -translate-x-1/2 z-50 flex gap-1 p-2 rounded-full bg-background/95 border border-border/40 shadow-lg transition-all duration-200",
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      )}
      style={{
        bottom: 'calc(100% + 0.5rem)',
        left: '50%',
      }}
    >
      {reactionsList.map(({ emoji, type, label }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "flex flex-col items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-xl",
            "group relative",
            currentReaction === type && "bg-gray-100 dark:bg-gray-800"
          )}
        >
          <span className="transition-transform group-hover:scale-125">
            {emoji}
          </span>
          <span className="absolute -bottom-8 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
