
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Send, Mic } from "lucide-react";

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({ 
  newMessage, 
  setNewMessage, 
  handleSendMessage,
  isLoading 
}: ChatInputProps) {
  return (
    <form onSubmit={handleSendMessage} className="p-2 bg-[#202C33]">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Smile className="h-6 w-6" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Paperclip className="h-6 w-6" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mensagem"
          className="flex-1 bg-[#2A3942] border-none text-white placeholder-gray-400"
        />
        {newMessage.trim() ? (
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <Send className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white bg-green-500 hover:bg-green-600"
          >
            <Mic className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>
    </form>
  );
}
