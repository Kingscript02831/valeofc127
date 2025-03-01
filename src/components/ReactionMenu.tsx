
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
      "absolute bottom-full left-0 mb-2 p-4 rounded-3xl bg-gray-900/95 border border-gray-800 shadow-lg transition-all duration-200 grid grid-cols-3 gap-x-8 gap-y-4 z-50",
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    )}>
      {reactionsList.map(({ emoji, type, label }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "flex flex-col items-center gap-2 transition-all",
            "group relative",
            currentReaction === type && "scale-110"
          )}
        >
          <div className="w-14 h-14 flex items-center justify-center">
            <img 
              src={emoji} 
              alt={label} 
              className="w-12 h-12 transition-transform group-hover:scale-125"
            />
          </div>
          <span className="text-gray-300 text-sm">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
