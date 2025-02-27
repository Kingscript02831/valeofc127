
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message, MessageType } from "@/components/chat/Message";
import { toast } from "sonner";
import { getCurrentUser, createOrGetChat } from "@/utils/supabase";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("Carregando...");
  const [recipientAvatar, setRecipientAvatar] = useState<string | undefined>(undefined);
  const [onlineStatus, setOnlineStatus] = useState("offline");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          toast.error("Você precisa estar logado");
          navigate("/login");
          return;
        }

        setCurrentUserId(currentUser.id);

        if (!chatId) {
          toast.error("ID de conversa inválido");
          navigate("/chat");
          return;
        }

        // Buscar informações do destinatário
        const { data: recipientData, error: recipientError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', chatId)
          .single();

        if (recipientError || !recipientData) {
          toast.error("Usuário não encontrado");
          navigate("/chat");
          return;
        }

        setRecipient(recipientData.username || "Usuário");
        setRecipientAvatar(recipientData.avatar_url);
        setOnlineStatus("online"); // Simplificado para teste

        // Criar ou obter chat existente
        const roomId = await createOrGetChat(currentUser.id, chatId);
        setChatRoomId(roomId);

        // Carregar mensagens
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', roomId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        setMessages(
          messages?.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.sender_id,
            timestamp: new Date(msg.created_at),
          })) || []
        );

      } catch (error) {
        console.error("Erro ao inicializar chat:", error);
        toast.error("Erro ao carregar conversa");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [chatId, navigate]);

  useEffect(() => {
    if (!chatRoomId) return;

    const channel = supabase
      .channel(`chat-${chatRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatRoomId}`
      }, payload => {
        const msg = payload.new;
        setMessages(prev => [
          ...prev,
          {
            id: msg.id,
            text: msg.content,
            sender: msg.sender_id,
            timestamp: new Date(msg.created_at),
          }
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!currentUserId || !chatId || !chatRoomId) {
      toast.error("Não foi possível enviar a mensagem");
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatRoomId,
          sender_id: currentUserId,
          content: text,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#075E54]"></div>
        <p className="text-gray-500 mt-4">Carregando conversa...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <ChatHeader 
        recipient={recipient} 
        status={onlineStatus}
        recipientAvatar={recipientAvatar}
      />
      
      <div className="flex-1 overflow-y-auto p-4 bg-[#ECE5DD] dark:bg-gray-800">
        {messages.length > 0 ? (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isCurrentUser={message.sender === currentUserId}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white dark:bg-gray-700 rounded-full p-6 mb-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#075E54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Nenhuma mensagem ainda</p>
            <p className="text-gray-500 text-sm mt-2">Diga olá para {recipient}!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSendMessage} sending={sending} />
    </div>
  );
};

export default Chat;
