
import React from 'react';

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
}

const ReactionMenu: React.FC<ReactionMenuProps> = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  const reactions = [
    { type: 'like', emoji: '👍' },
    { type: 'love', emoji: '❤️' },
    { type: 'haha', emoji: '😂' },
    { type: 'sad', emoji: '😞' },
    { type: 'angry', emoji: '🤬' },
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 p-2 bg-background rounded-full shadow-lg border border-border flex gap-1 animate-in fade-in slide-in-from-bottom-5">
      {reactions.map(({ type, emoji }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="text-xl hover:scale-125 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
