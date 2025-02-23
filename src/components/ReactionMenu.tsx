
import { cn } from "@/lib/utils";

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
}

const ReactionMenu = ({ isOpen, onSelect }: ReactionMenuProps) => {
  if (!isOpen) return null;

  const reactions = [
    { emoji: "👍", type: "like", label: "Curti" },
    { emoji: "❤️", type: "love", label: "Amei" },
    { emoji: "😂", type: "haha", label: "Haha" },
    { emoji: "🔥", type: "fire", label: "Fogo" },
    { emoji: "🤬", type: "angry", label: "Grr" },
  ];

  return (
    <div className={cn(
      "absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-full bg-background/95 border shadow-lg",
      "transition-all duration-200 z-50"
    )}>
      {reactions.map(({ emoji, type, label }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="p-2 hover:bg-accent rounded-full transition-all group relative"
          aria-label={label}
        >
          <span className="text-xl">{emoji}</span>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-background border px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
