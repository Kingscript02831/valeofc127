
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Chat } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadChats() {
      try {
        const data = await chatService.getUserChats();
        setChats(data);
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  function formatTimestamp(timestamp: string) {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return format(date, "HH:mm", { locale: ptBR });
      } else if (isYesterday(date)) {
        return "Ontem";
      } else {
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
    } catch (error) {
      return "";
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto pt-20 pb-24">
        <h1 className="mb-4 text-2xl font-bold">Conversas</h1>
        
        {chats.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-gray-100 p-6 text-center dark:bg-gray-800">
            <p className="mb-4 text-lg font-medium text-gray-600 dark:text-gray-300">
              Você ainda não tem conversas
            </p>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              Inicie uma conversa com alguém para começar a trocar mensagens
            </p>
          </div>
        ) : (
          <div className="space-y-2 divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="flex h-auto w-full items-start justify-start p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate(`/chat?id=${chat.id}`)}
              >
                <Avatar className="mr-3 h-12 w-12 flex-shrink-0">
                  <AvatarImage src={chat.other_user?.avatar_url || ''} />
                  <AvatarFallback>
                    {chat.other_user?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {chat.other_user?.full_name || "Usuário"}
                    </h3>
                    {chat.last_message_time && (
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(chat.last_message_time)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-gray-500">
                    {chat.last_message || "Nenhuma mensagem"}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
