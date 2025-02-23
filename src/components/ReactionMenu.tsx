
import { useState, useEffect } from 'react';

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
}

const ReactionMenu = ({ isOpen, onSelect }: ReactionMenuProps) => {
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
      className={`absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-full bg-background/95 border border-border/40 shadow-lg transition-all duration-200 ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      {['👍', '❤️', '😂', '😞', '🤬'].map((reaction, index) => (
        <button
          key={index}
          onClick={() => onSelect(
            index === 0 ? 'like' :
            index === 1 ? 'love' :
            index === 2 ? 'haha' :
            index === 3 ? 'sad' : 'angry'
          )}
          className="text-2xl hover:scale-125 transition-transform p-1"
        >
          {reaction}
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
