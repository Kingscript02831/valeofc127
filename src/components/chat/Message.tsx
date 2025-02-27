
import { formatDate } from "@/lib/utils";

export interface MessageType {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
}

export const Message = ({ message, isCurrentUser }: MessageProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[70%] rounded-lg p-3 ${
          isCurrentUser 
            ? 'bg-primary text-white rounded-tr-none' 
            : 'bg-white dark:bg-gray-800 rounded-tl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
          {formatDate(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
