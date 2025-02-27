
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Message as MessageType } from "@/types/chat";
import { Navbar2 } from "@/components/Navbar2";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("id");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState({
    username: "",
    full_name: "",
    avatar_url: ""
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatId) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");
        
        // Find the other participant
        const { data: participants, error: participantsError } = await supabase
          .from('chat_participants')
          .select('user_id, profiles(username, full_name, avatar_url)')
          .eq('chat_id', chatId);
          
        if (participantsError) throw participantsError;
        
        const otherParticipant = participants.find(p => p.user_id !== user.id);
        if (otherParticipant && otherParticipant.profiles) {
          setRecipientInfo({
            username: otherParticipant.profiles.username || "",
            full_name: otherParticipant.profiles.full_name || "",
            avatar_url: otherParticipant.profiles.avatar_url || ""
          });
        }
        
        setMessages(messagesData as MessageType[]);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newMessage = payload.new as MessageType;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const message = {
        chat_id: chatId,
        sender_id: user.id,
        content: newMessage.trim(),
        read: false
      };
      
      await supabase.from('messages').insert([message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow p-3 flex items-center">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={recipientInfo.avatar_url} alt={recipientInfo.username} />
          <AvatarFallback>{recipientInfo.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="ml-3">
          <h2 className="font-medium">{recipientInfo.full_name || recipientInfo.username}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          messages.map((message) => {
            const { data: { user } } = supabase.auth.getUser() as any;
            const isCurrentUser = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex mb-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-white dark:bg-gray-800 text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form 
        onSubmit={handleSendMessage}
        className="bg-white dark:bg-gray-800 p-3 flex items-center sticky bottom-0"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite uma mensagem"
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 focus:outline-none"
        />
        <Button 
          type="submit"
          size="icon"
          className="ml-2 rounded-full"
          disabled={!newMessage.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
      
      <BottomNav />
    </div>
  );
};

export default Chat;
