
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message as MessageComponent, MessageType } from "@/components/chat/Message";
import { chatService } from "@/services/chatService";
import { Chat as ChatType, Message } from "@/types/chat";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chat, setChat] = useState<ChatType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const chatId = searchParams.get("id");

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    // Subscribe to new messages in this chat
    const subscription = supabase
      .channel(`messages:chat_id=eq.${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        // Convert to MessageType
        const messageType: MessageType = {
          id: newMessage.id,
          text: newMessage.content,
          sender: newMessage.sender_id,
          timestamp: new Date(newMessage.created_at),
        };
        
        setMessages(prev => [...prev, messageType]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId]);

  // Load chat and messages
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) {
        navigate("/chat-home");
        return;
      }

      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          navigate("/login");
          return;
        }
        
        setCurrentUserId(userData.user.id);
        
        const chatData = await chatService.getChatById(chatId);
        
        if (!chatData) {
          setError("Chat não encontrado");
          return;
        }
        
        setChat(chatData);
        
        // Convert messages to MessageType
        const formattedMessages: MessageType[] = chatData.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender_id,
          timestamp: new Date(msg.created_at),
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        setMessages(formattedMessages);
        
        // Mark messages as read
        await chatService.markMessagesAsRead(chatId);
        
      } catch (err) {
        console.error("Failed to load chat:", err);
        setError("Falha ao carregar a conversa. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherParticipant = () => {
    if (!chat || !currentUserId) return null;
    return chat.chat_participants.find(p => p.user_id !== currentUserId);
  };

  const handleSendMessage = async (text: string) => {
    if (!chatId || !text.trim()) return;
    
    try {
      setSending(true);
      await chatService.sendMessage(chatId, text);
      // The new message will be added via the subscription
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#E5DDD5] items-center justify-center">
        <Spinner className="h-8 w-8 text-[#075E54]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[#E5DDD5] items-center justify-center p-4 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => navigate("/chat-home")} 
          className="px-4 py-2 bg-[#075E54] text-white rounded"
        >
          Voltar para conversas
        </button>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();
  const recipientName = otherParticipant?.profiles?.username || 'Usuário';
  const avatarUrl = otherParticipant?.profiles?.avatar_url;
  const onlineStatus = otherParticipant?.profiles?.online_status ? 'online' : 'offline';

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5]">
      <ChatHeader 
        recipient={recipientName} 
        avatar={avatarUrl}
        status={onlineStatus}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageComponent
            key={message.id}
            message={message}
            isCurrentUser={message.sender === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSendMessage} isLoading={sending} />
    </div>
  );
};

export default Chat;
