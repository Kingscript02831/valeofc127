
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "@/types/chat";
import { Navbar2 } from "@/components/Navbar2";
import { BottomNav } from "@/components/BottomNav";

export const ChatList = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");
        
        // Get chats where user is a participant
        const { data: participations, error: participationsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', user.id);
          
        if (participationsError) throw participationsError;
        if (!participations.length) {
          setChats([]);
          return;
        }
        
        const chatIds = participations.map(p => p.chat_id);
        
        // Get all chats with their participants and last message
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select(`
            *,
            participants:chat_participants(
              *,
              profile:profiles(username, full_name, avatar_url)
            ),
            messages:messages(*)
          `)
          .in('id', chatIds)
          .order('updated_at', { ascending: false });
          
        if (chatsError) throw chatsError;
        
        // Format the chat data to include other participant info and last message
        const formattedChats = chatsData.map((chat: any) => {
          // Find the other participant
          const otherParticipant = chat.participants.find((p: any) => p.user_id !== user.id);
          const otherProfile = otherParticipant?.profile;
          
          // Get the last message
          const messages = chat.messages || [];
          messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const lastMessage = messages[0];
          
          // Count unread messages
          const unreadCount = messages.filter((m: any) => m.sender_id !== user.id && !m.read).length;
          
          return {
            id: chat.id,
            otherUser: {
              id: otherParticipant?.user_id,
              username: otherProfile?.username || "Usuário",
              full_name: otherProfile?.full_name || "",
              avatar_url: otherProfile?.avatar_url || ""
            },
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              timestamp: lastMessage.created_at,
              sender_id: lastMessage.sender_id
            } : null,
            unreadCount
          };
        });
        
        setChats(formattedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        // Refresh the chat list when a new message arrives
        fetchChats();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar2 />
      
      <div className="flex items-center p-2 bg-white dark:bg-gray-800 shadow">
        <input
          type="text"
          placeholder="Pesquisar conversas"
          className="w-full bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não tem conversas</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Inicie uma conversa com outro usuário para começar a trocar mensagens
            </p>
          </div>
        ) : (
          chats.map((chat) => (
            <Link 
              to={`/chat?id=${chat.id}`} 
              key={chat.id}
              className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.otherUser.avatar_url} alt={chat.otherUser.username} />
                <AvatarFallback>{chat.otherUser.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{chat.otherUser.full_name || chat.otherUser.username}</span>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between mt-1">
                  {chat.lastMessage ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                      {chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Nenhuma mensagem
                    </p>
                  )}
                  
                  {chat.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default ChatList;
