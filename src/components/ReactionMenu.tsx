
import { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { getReactionIcon } from "@/utils/emojisPosts";

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  currentReaction?: string;
}

const ReactionMenu: React.FC<ReactionMenuProps> = ({ isOpen, onSelect, currentReaction }) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  const reactionsList = [
    { emoji: '/amei1.png', type: 'love', label: 'Amei' },
    { emoji: '/haha1.png', type: 'haha', label: 'Haha' },
    { emoji: '/uau1.png', type: 'wow', label: 'Uau' },
    { emoji: '/triste1.png', type: 'sad', label: 'Triste' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Close menu if click outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn(
      "absolute bottom-full left-0 mb-2 p-3 rounded-xl bg-gray-900/95 border border-gray-800 shadow-lg transition-all duration-200 z-50 w-full reaction-menu",
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    )} ref={menuRef}>
      <div className="grid grid-cols-4 gap-2 reaction-menu-grid">
        {reactionsList.map(({ emoji, type, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              "flex flex-col items-center p-1 rounded-lg hover:bg-gray-800 transition-colors duration-200 reaction-button",
              currentReaction === type ? "bg-gray-800/70" : ""
            )}
          >
            <img 
              src={emoji} 
              alt={label} 
              className="w-10 h-10 mb-1 reaction-emoji"
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
