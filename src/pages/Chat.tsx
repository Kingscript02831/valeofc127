
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Chat as ChatComponent } from "@/components/chat/Chat";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message } from "@/components/chat/Message";
import { Message as MessageType } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("id");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatId) {
      navigate("/chat-home");
      return;
    }

    const loadMessages = async () => {
      try {
        const messagesData = await chatService.getChatMessages(chatId);
        setMessages(messagesData);

        // Get current user id
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;

        // Get chat details to determine the other user
        const { data: chats } = await supabase
          .from('chats')
          .select(`
            chat_participants(
              user_id,
              user:profiles(username, full_name, avatar_url)
            )
          `)
          .eq('id', chatId)
          .single();

        if (chats && chats.chat_participants) {
          const otherParticipant = chats.chat_participants.find(
            (p: any) => p.user_id !== currentUserId
          );
          
          if (otherParticipant?.user) {
            setOtherUser(otherParticipant.user);
          }
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const subscription = chatService.subscribeToMessages(chatId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!chatId || !content.trim()) return;

    try {
      await chatService.sendMessage({
        chat_id: chatId,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!chatId) {
    return <div>Chat não encontrado</div>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {otherUser && <ChatHeader user={otherUser} />}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
