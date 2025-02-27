
import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MessageType {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  deleted?: boolean;
}

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
  onDelete?: (messageId: string) => void;
}

export const Message = ({ message, isCurrentUser, onDelete }: MessageProps) => {
  const [deleting, setDeleting] = useState(false);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleDeleteMessage = async () => {
    if (!isCurrentUser || !message.id) return;
    
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('messages')
        .update({ deleted: true, content: '[Mensagem removida]' })
        .eq('id', message.id)
        .eq('sender_id', message.sender); // Garantir que só o remetente possa excluir
      
      if (error) {
        throw error;
      }
      
      if (onDelete) {
        onDelete(message.id);
      }
      
      toast.success("Mensagem excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      toast.error("Não foi possível excluir a mensagem");
    } finally {
      setDeleting(false);
    }
  };

  if (message.deleted) {
    return (
      <div className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`px-3 py-2 rounded-lg max-w-[80%] text-gray-500 italic bg-gray-200 dark:bg-gray-700`}>
          <p>Mensagem removida</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`px-3 py-2 rounded-lg max-w-[80%] ${
          isCurrentUser 
            ? 'bg-[#DCF8C6] text-gray-800 dark:bg-[#025C4C] dark:text-white'
            : 'bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <p className="break-words">{message.text}</p>
          
          {isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={deleting}>
                <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  {deleting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDeleteMessage} className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir mensagem
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="text-xs text-gray-500 text-right mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
