
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
          .select('username, avatar_url, online_status')
          .eq('id', chatId)
          .single();

        if (recipientError || !recipientProfile) {
          toast.error("Destinatário não encontrado");
          navigate("/chat");
          return;
        }

        setRecipient(recipientProfile.username || "Usuário");
        setRecipientAvatar(recipientProfile.avatar_url || undefined);
        setOnlineStatus(recipientProfile.online_status ? "online" : "offline");

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
      // Em um app real, você teria uma tabela 'chats' e 'messages'
      // Esta é uma implementação simplificada
      
      // Simular mensagens de demonstração por enquanto
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
        {
          id: "3",
          text: "Estou bem também! O que você está fazendo?",
          sender: recipientId,
          timestamp: new Date(Date.now() - 60000 * 25),
        },
        {
          id: "4",
          text: "Estou trabalhando em um projeto novo, é muito interessante!",
          sender: userId,
          timestamp: new Date(Date.now() - 60000 * 20),
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      toast.error("Erro ao carregar mensagens");
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
      // Em um app real, você salvaria a mensagem no banco
      // Esta é uma implementação simplificada
      
      const newMessage: MessageType = {
        id: uuidv4(),
        text,
        sender: currentUserId,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newMessage]);
      
      // Simular envio para o Supabase
      toast.success("Mensagem enviada");
      
      // Simular uma resposta do outro usuário
      setTimeout(() => {
        if (recipientId) {
          const responseMessage: MessageType = {
            id: uuidv4(),
            text: `Resposta automática do usuário ${recipient}: Recebi sua mensagem`,
            sender: recipientId,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, responseMessage]);
        }
      }, 1000);
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
        <p className="text-gray-500">Carregando conversa...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <ChatHeader 
        recipient={recipient} 
        status={onlineStatus}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
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
            <p className="text-gray-500">Nenhuma mensagem ainda. Diga olá!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
};

export default Chat;
