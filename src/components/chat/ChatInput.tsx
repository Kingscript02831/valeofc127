
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSend, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-gray-100 p-3 flex items-center sticky bottom-0"
    >
      <button 
        type="button"
        className="text-gray-500 p-2 rounded-full hover:bg-gray-200 mr-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite uma mensagem"
        className="flex-1 bg-white rounded-full px-4 py-2 focus:outline-none"
        disabled={isLoading}
      />
      <button 
        type="submit"
        className={`ml-2 bg-[#075E54] text-white p-2 rounded-full flex items-center justify-center ${isLoading || !message.trim() ? 'opacity-50' : ''}`}
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? (
          <Spinner className="h-5 w-5 text-white" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        )}
      </button>
    </form>
  );
};
