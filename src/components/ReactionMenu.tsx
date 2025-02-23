
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThumbsUp, Heart, Smile, Frown, Flame, Angry } from 'lucide-react';

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

  const reactions = [
    { icon: ThumbsUp, type: 'like', label: 'Curti', color: 'text-blue-500' },
    { icon: Heart, type: 'love', label: 'Amei', color: 'text-red-500' },
    { icon: Smile, type: 'haha', label: 'Haha', color: 'text-yellow-500' },
    { icon: Flame, type: 'fire', label: 'Fogo', color: 'text-orange-500' },
    { icon: Frown, type: 'sad', label: 'Triste', color: 'text-purple-500' },
    { icon: Angry, type: 'angry', label: 'Grr', color: 'text-orange-500' },
  ];

  return (
    <div className={cn(
      "absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-full bg-background/95 border border-border/40 shadow-lg transition-all duration-200",
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    )}>
      {reactions.map(({ icon: Icon, type, label, color }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "flex flex-col items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all",
            "group relative"
          )}
        >
          <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-125", color)} />
          <span className="absolute -bottom-8 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
