
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { chatService } from "@/services/chatService";
import { Chat, ChatParticipant } from "@/types/chat";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from 'date-fns/locale';

export const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data && data.user) {
          setCurrentUserId(data.user.id);
        }
        
        const chatsData = await chatService.getChats();
        setChats(chatsData);
      } catch (err) {
        console.error("Failed to load chats:", err);
        setError("Falha ao carregar conversas. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  // Get the other participant in the chat
  const getOtherParticipant = (chat: Chat): ChatParticipant | undefined => {
    if (!currentUserId) return undefined;
    return chat.chat_participants.find(p => p.user_id !== currentUserId);
  };

  // Get the last message in the chat
  const getLastMessage = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return null;
    return chat.messages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };

  // Calculate unread messages count
  const getUnreadCount = (chat: Chat) => {
    if (!currentUserId) return 0;
    
    const currentUserParticipant = chat.chat_participants.find(p => p.user_id === currentUserId);
    if (!currentUserParticipant || !currentUserParticipant.last_read_at) return 0;
    
    const lastReadDate = new Date(currentUserParticipant.last_read_at);
    
    return chat.messages.filter(m => 
      m.sender_id !== currentUserId && 
      new Date(m.created_at) > lastReadDate
    ).length;
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    const otherParticipant = getOtherParticipant(chat);
    if (!otherParticipant || !otherParticipant.profiles) return false;
    
    const profile = otherParticipant.profiles;
    return (
      profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-[#075E54] text-white p-3">
          <h1 className="text-xl font-bold">WhatsApp</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8 text-[#075E54]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-[#075E54] text-white p-3">
          <h1 className="text-xl font-bold">WhatsApp</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div>
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#075E54] text-white rounded"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-[#075E54] text-white p-3">
        <h1 className="text-xl font-bold">WhatsApp</h1>
      </div>
      
      <div className="flex items-center p-2 bg-[#F6F6F6]">
        <Input
          type="text"
          placeholder="Pesquisar ou iniciar uma nova conversa"
          className="w-full bg-white rounded-full px-4 py-2 text-sm focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
            <p>Nenhuma conversa encontrada.</p>
            <p className="mt-2">Comece uma nova conversa procurando por um usuário.</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const lastMessage = getLastMessage(chat);
            const unreadCount = getUnreadCount(chat);
            
            if (!otherParticipant || !otherParticipant.profiles) return null;
            
            const profile = otherParticipant.profiles;
            const chatName = profile.username || 'Usuário';
            const lastMessageTime = lastMessage 
              ? formatDistanceToNow(new Date(lastMessage.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })
              : '';
            
            return (
              <Link 
                to={`/chat?id=${chat.id}`} 
                key={chat.id}
                className="flex items-center p-3 border-b hover:bg-gray-100"
              >
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username || 'Usuário'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    chatName.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{profile.full_name || chatName}</span>
                    <span className="text-xs text-gray-500">
                      {lastMessageTime}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {lastMessage ? lastMessage.content : 'Nenhuma mensagem'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="bg-[#25D366] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
