
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message, MessageType } from "@/components/chat/Message";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createOrGetChat, markMessagesAsRead, sendMessage, getUserProfile } from "@/utils/supabase";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("Carregando...");
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [recipientAvatar, setRecipientAvatar] = useState<string | undefined>(undefined);
  const [onlineStatus, setOnlineStatus] = useState("offline");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        console.log("Iniciando carregamento de dados do chat");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Usuário não autenticado");
          toast.error("Você precisa estar logado para acessar o chat");
          navigate("/login");
          return;
        }

        console.log("Usuário logado:", session.user.id);
        setCurrentUserId(session.user.id);

        if (!chatId) {
          console.log("ID de chat inválido");
          toast.error("ID de conversa inválido");
          navigate("/chat");
          return;
        }

        setRecipientId(chatId);
        
        // Obter perfil do destinatário
        try {
          const profile = await getUserProfile(chatId);
          setRecipient(profile.username || profile.full_name || "Usuário");
          setRecipientAvatar(profile.avatar_url || undefined);
        } catch (error) {
          console.error("Erro ao buscar perfil do destinatário:", error);
          toast.error("Não foi possível carregar informações do destinatário");
        }
        
        // Verificar status online (simulado)
        const isOnline = Math.random() > 0.5;
        setOnlineStatus(isOnline ? "online" : "offline");

        try {
          // Criar ou obter o chat
          const roomId = await createOrGetChat(session.user.id, chatId);
          console.log("ID da sala de chat:", roomId);
          setChatRoomId(roomId);
          
          // Buscar mensagens
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('id, content, sender_id, created_at, read, deleted')
            .eq('chat_id', roomId)
            .order('created_at', { ascending: true });
          
          if (messagesError) {
            console.error("Erro ao buscar mensagens:", messagesError);
            throw messagesError;
          }
          
          if (messagesData && messagesData.length > 0) {
            console.log("Mensagens encontradas:", messagesData.length);
            setMessages(messagesData.map(msg => ({
              id: msg.id,
              text: msg.content,
              sender: msg.sender_id,
              timestamp: new Date(msg.created_at),
              deleted: msg.deleted
            })));
            
            // Marcar mensagens como lidas
            await markMessagesAsRead(roomId, session.user.id);
          } else {
            console.log("Nenhuma mensagem encontrada");
          }
        } catch (error) {
          console.error("Erro ao criar/obter chat:", error);
          toast.error("Erro ao iniciar conversa");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar conversa");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMessages();
  }, [chatId, navigate]);

  // Configurar canal de realtime quando chatRoomId estiver disponível
  useEffect(() => {
    if (!chatRoomId) return;

    console.log("Configurando canal realtime para", chatRoomId);
    const channel = supabase
      .channel(`chat-${chatRoomId}`)
      .on('postgres_changes', {
        event: '*', // Ouvir todos os eventos (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatRoomId}`
      }, payload => {
        console.log("Evento recebido via realtime:", payload);
        
        if (payload.eventType === 'INSERT') {
          // Nova mensagem
          const newMessage = payload.new;
          if (newMessage) {
            const messageType: MessageType = {
              id: newMessage.id,
              text: newMessage.content,
              sender: newMessage.sender_id,
              timestamp: new Date(newMessage.created_at),
              deleted: newMessage.deleted
            };
            
            setMessages(prev => {
              // Evitar duplicatas
              if (prev.some(msg => msg.id === messageType.id)) {
                return prev;
              }
              return [...prev, messageType];
            });
            
            // Se a mensagem for de outra pessoa e não do usuário atual, marcar como lida
            if (currentUserId && newMessage.sender_id !== currentUserId) {
              markMessagesAsRead(chatRoomId, currentUserId);
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          // Mensagem atualizada (ex: marcada como excluída)
          const updatedMessage = payload.new;
          if (updatedMessage) {
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id 
                ? {
                    ...msg,
                    text: updatedMessage.content,
                    deleted: updatedMessage.deleted
                  } 
                : msg
            ));
          }
        }
      })
      .subscribe(status => {
        console.log("Status da inscrição do canal:", status);
      });

    return () => {
      console.log("Removendo canal realtime");
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, currentUserId]);

  // Rolar para o final quando mensagens mudam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    if (!currentUserId || !recipientId || !chatRoomId) {
      console.error("Dados necessários não disponíveis:", { currentUserId, recipientId, chatRoomId });
      toast.error("Não foi possível enviar a mensagem");
      return;
    }
    
    setSending(true);
    console.log("Enviando mensagem para", chatRoomId);
    
    try {
      // Inserir a mensagem
      await sendMessage(chatRoomId, currentUserId, text);
      
      // Não é necessário adicionar a mensagem localmente, pois 
      // o canal Realtime cuidará disso automaticamente
      console.log("Mensagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, deleted: true, text: '[Mensagem removida]' } 
        : msg
    ));
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
              onDelete={handleDeleteMessage}
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
