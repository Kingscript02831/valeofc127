
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chat } from "@/types/chat";

export const ChatList = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>("1"); // ID fixo para demonstração

  useEffect(() => {
    fetchChats(userId || "1");
  }, [userId]);

  const fetchChats = async (currentUserId: string) => {
    // Implementação futura: buscar chats do Supabase
    // Por enquanto, usando dados simulados
    
    const mockChats: Chat[] = [
      {
        id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participants: [
          {
            id: "p1",
            chat_id: "1",
            user_id: currentUserId,
            created_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
          },
          {
            id: "p2",
            chat_id: "1",
            user_id: "2",
            created_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
            profile: {
              username: "marcos",
              name: "Marcos Silva",
              avatar_url: "/placeholder.svg",
              online_status: true,
            }
          }
        ],
        messages: [
          {
            id: "msg1",
            chat_id: "1",
            sender_id: "2",
            content: "Oi, tudo bem?",
            created_at: new Date(Date.now() - 60000 * 30).toISOString(),
            read: true,
          }
        ]
      },
      {
        id: "2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participants: [
          {
            id: "p3",
            chat_id: "2",
            user_id: currentUserId,
            created_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
          },
          {
            id: "p4",
            chat_id: "2",
            user_id: "3",
            created_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
            profile: {
              username: "ana",
              name: "Ana Oliveira",
              avatar_url: "/placeholder.svg",
              online_status: false,
              last_seen: new Date(Date.now() - 60000 * 15).toISOString(),
            }
          }
        ],
        messages: [
          {
            id: "msg2",
            chat_id: "2",
            sender_id: currentUserId,
            content: "Olá, como vai?",
            created_at: new Date(Date.now() - 60000 * 120).toISOString(),
            read: false,
          }
        ]
      }
    ];
    
    setChats(mockChats);
  };

  const getOtherParticipant = (chat: Chat) => {
    if (!userId) return null;
    return chat.participants.find(p => p.user_id !== userId);
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return null;
    return chat.messages[chat.messages.length - 1];
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipant = getOtherParticipant(chat);
    if (!otherParticipant || !otherParticipant.profile) return false;
    
    const name = otherParticipant.profile.name?.toLowerCase() || '';
    const username = otherParticipant.profile.username?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || username.includes(query);
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-white p-4 flex items-center gap-4">
        <ArrowLeft className="h-6 w-6 cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-xl font-semibold">Conversas</h1>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar conversa"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredChats.length > 0 ? (
          <div className="divide-y">
            {filteredChats.map(chat => {
              const otherParticipant = getOtherParticipant(chat);
              const lastMessage = getLastMessage(chat);
              
              if (!otherParticipant || !otherParticipant.profile || !lastMessage) return null;
              
              return (
                <div 
                  key={chat.id}
                  className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/chat/${chat.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {otherParticipant.profile.avatar_url ? (
                          <img 
                            src={otherParticipant.profile.avatar_url} 
                            alt={otherParticipant.profile.name || 'Avatar'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                            {(otherParticipant.profile.username || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      {otherParticipant.profile.online_status && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <h2 className="font-semibold">
                          {otherParticipant.profile.name || otherParticipant.profile.username}
                        </h2>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(lastMessage.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                          {lastMessage.content}
                        </p>
                        {!lastMessage.read && lastMessage.sender_id !== userId && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-gray-500 text-center">
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Você ainda não tem conversas'}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
