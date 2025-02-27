
import { cn } from "@/lib/utils";

export type MessageType = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
};

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
}

export const Message = ({ message, isCurrentUser }: MessageProps) => {
  return (
    <div
      className={cn(
        "flex mb-3",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2 shadow-sm",
          isCurrentUser
            ? "bg-[#dcf8c6] text-dark rounded-tr-none"
            : "bg-white text-dark rounded-tl-none"
        )}
      >
        <p className="text-sm break-words">{message.text}</p>
        <p className="text-right text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
