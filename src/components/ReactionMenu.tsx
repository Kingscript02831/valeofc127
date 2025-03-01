
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { reactionsList } from '../utils/emojisPosts';

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

  // Preload images for faster loading
  useEffect(() => {
    reactionsList.forEach(({ emoji }) => {
      const img = new Image();
      img.src = emoji;
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn(
      "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl bg-gray-900/95 border border-gray-800 shadow-lg transition-all duration-200 z-50",
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    )}>
      <div className="flex overflow-x-auto pb-2 px-1 space-x-3 min-w-[250px] max-w-[95vw] scrollbar-hide">
        {reactionsList.map(({ emoji, type, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all flex-shrink-0 hover:bg-gray-800",
              currentReaction === type && "bg-gray-800 scale-110"
            )}
          >
            <img 
              src={emoji} 
              alt={label} 
              className="w-10 h-10 mb-1"
              loading="eager"
            />
            <span className="text-gray-300 text-xs font-medium text-center whitespace-nowrap">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionMenu;
