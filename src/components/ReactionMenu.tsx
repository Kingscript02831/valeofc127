
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { reactionsList } from '../utils/emojisPosts';

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  currentReaction?: string;
}

const ReactionMenu = ({ isOpen, onSelect, currentReaction }: ReactionMenuProps) => {
  const [mounted, setMounted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

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
    let loadedCount = 0;
    const totalImages = reactionsList.length;
    
    const preloadImages = () => {
      reactionsList.forEach((reaction) => {
        const img = new Image();
        img.src = reaction.emoji;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          console.error(`Failed to load image: ${reaction.emoji}`);
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
      });
    };
    
    if (mounted && !imagesLoaded) {
      preloadImages();
    }
  }, [mounted, imagesLoaded]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'reaction-menu glass absolute p-2 rounded-full flex items-center justify-center gap-2 transition-all duration-200',
        isOpen
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      )}
    >
      {reactionsList.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => onSelect(reaction.type)}
          className={cn(
            'reaction-button flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all',
            currentReaction === reaction.type && 'bg-white/20'
          )}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 relative flex items-center justify-center">
            <img
              src={reaction.emoji}
              alt={reaction.label}
              className={cn(
                'reaction-emoji w-full h-full object-contain transition-transform',
                currentReaction === reaction.type && 'reaction-selected'
              )}
            />
          </div>
          <span className="text-xs text-white font-medium mt-1">{reaction.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
