
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import { reactionsList } from "@/utils/emojisPosts";

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  currentReaction?: string;
}

const ReactionMenu = ({ isOpen, onSelect, currentReaction }: ReactionMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Close menu by clicking elsewhere
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn(
      "absolute bottom-full left-0 mb-2 p-3 rounded-xl bg-gray-900/95 border border-gray-800 shadow-lg transition-all duration-200 z-50 max-w-[360px] w-auto",
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    )} ref={menuRef}>
      <div className="grid grid-cols-3 gap-2">
        {reactionsList.map(({ emoji, type, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all hover:bg-gray-800",
              currentReaction === type && "bg-gray-800 scale-110"
            )}
          >
            <img 
              src={emoji} 
              alt={label} 
              className="w-10 h-10 mb-1"
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
