
import { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isOwnMessage
            ? "bg-[#005C4B]"
            : "bg-[#202C33]"
        }`}
      >
        <p className="break-words text-white">{message.content}</p>
      </div>
    </div>
  );
}
