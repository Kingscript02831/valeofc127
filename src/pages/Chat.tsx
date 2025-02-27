
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message, MessageType } from "@/components/chat/Message";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Função para gerar IDs únicos
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [recipient, setRecipient] = useState("Carregando...");
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [recipientAvatar, setRecipientAvatar] = useState<string | undefined>(undefined);
  const [onlineStatus, setOnlineStatus] = useState("offline");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        // Obter o usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Usuário não autenticado");
          navigate("/login");
          return;
        }

        setCurrentUserId(session.user.id);

        // Obter o nome de usuário atual
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (currentUserProfile) {
          setCurrentUsername(currentUserProfile.username || "");
        }

        // Verificar se chatId é válido
        if (!chatId) {
          toast.error("ID de conversa inválido");
          navigate("/chat");
          return;
        }

        // Obter informações do destinatário
        setRecipientId(chatId);
        const { data: recipientProfile, error: recipientError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', chatId)
          .single();

        if (recipientError || !recipientProfile) {
          toast.error("Destinatário não encontrado");
          navigate("/chat");
          return;
        }

        setRecipient(recipientProfile.username || "Usuário");
        setRecipientAvatar(recipientProfile.avatar_url || undefined);
        
        // Verificar status online (simulado por enquanto)
        const isOnline = Math.random() > 0.5; // Simulação de status online
        setOnlineStatus(isOnline ? "online" : "offline");

        // Buscar mensagens existentes
        await fetchMessages(session.user.id, chatId);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar conversa");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMessages();

    // Configurar subscription para atualizações em tempo real
    let channel: any;
    if (chatId) {
      channel = supabase
        .channel(`chat-${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, payload => {
          const newMessage = payload.new;
          if (newMessage) {
            appendNewMessage(newMessage);
          }
        })
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [chatId, navigate]);

  const fetchMessages = async (userId: string, recipientId: string) => {
    try {
      // Criar ou obter chat_id
      const chatRoomId = [userId, recipientId].sort().join('_');
      
      // Buscar mensagens do chat
      const { data: chatMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatRoomId)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      if (chatMessages && chatMessages.length > 0) {
        // Converter para o formato de mensagem da UI
        const formattedMessages: MessageType[] = chatMessages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender_id,
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
      } else {
        // Sem mensagens, apenas inicializar com um array vazio
        setMessages([]);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      
      // Fallback para mensagens de exemplo se houver erro
      const mockMessages: MessageType[] = [
        {
          id: "1",
          text: "Oi, tudo bem?",
          sender: recipientId,
          timestamp: new Date(Date.now() - 60000 * 30),
        },
        {
          id: "2",
          text: "Tudo ótimo! E com você?",
          sender: userId,
          timestamp: new Date(Date.now() - 60000 * 28),
        },
      ];
      
      setMessages(mockMessages);
      toast.error("Erro ao carregar mensagens. Usando dados de exemplo.");
    }
  };

  const appendNewMessage = (messageData: any) => {
    // Converter dados do banco para o formato MessageType
    const newMessage: MessageType = {
      id: messageData.id,
      text: messageData.content,
      sender: messageData.sender_id,
      timestamp: new Date(messageData.created_at),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Rolar para o final quando as mensagens mudarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!currentUserId || !recipientId) {
      toast.error("Não foi possível enviar a mensagem");
      return;
    }
    
    setSending(true);
    
    try {
      // Criar chat_id ordenando os IDs dos usuários
      const chatRoomId = [currentUserId, recipientId].sort().join('_');
      
      // Inserir a mensagem no banco de dados
      const { data: newMessageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatRoomId,
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: text,
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      // Adicionar mensagem à UI
      const newMessage: MessageType = {
        id: newMessageData?.id || uuidv4(),
        text,
        sender: currentUserId,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newMessage]);
      
      // Simular uma resposta do outro usuário (apenas para demonstração)
      if (Math.random() > 0.5) {
        setTimeout(() => {
          if (recipientId) {
            const responseMessage: MessageType = {
              id: uuidv4(),
              text: `Resposta automática: Recebi sua mensagem "${text}"`,
              sender: recipientId,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, responseMessage]);
          }
        }, 1000 + Math.random() * 2000);
      }
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
      
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
};

export default Chat;
