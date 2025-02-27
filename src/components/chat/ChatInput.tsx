
import { useState, useRef, KeyboardEvent } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSend(trimmedMessage);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="p-3 bg-background border-t flex items-end gap-2">
      <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <Paperclip className="h-5 w-5" />
      </button>
      
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem"
          className="resize-none py-2 min-h-[40px] max-h-[150px] pr-10"
          rows={1}
        />
        <button className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <Smile className="h-5 w-5" />
        </button>
      </div>
      
      <button 
        onClick={handleSend}
        disabled={!message.trim()}
        className={`p-3 rounded-full flex items-center justify-center ${
          message.trim() 
            ? "bg-primary text-white" 
            : "bg-gray-200 text-gray-500 dark:bg-gray-700"
        }`}
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};
