
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message, MessageType } from "@/components/chat/Message";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        console.log("Iniciando carregamento de dados do chat");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Usuário não autenticado");
          toast.error("Usuário não autenticado");
          navigate("/login");
          return;
        }

        console.log("Usuário logado:", session.user.id);
        setCurrentUserId(session.user.id);

        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (currentUserProfile) {
          setCurrentUsername(currentUserProfile.username || "");
        }

        if (!chatId) {
          console.log("ID de chat inválido");
          toast.error("ID de conversa inválido");
          navigate("/chat");
          return;
        }

        setRecipientId(chatId);
        const { data: recipientProfile, error: recipientError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', chatId)
          .single();

        if (recipientError || !recipientProfile) {
          console.error("Erro ao buscar perfil do destinatário:", recipientError);
          toast.error("Destinatário não encontrado");
          navigate("/chat");
          return;
        }

        setRecipient(recipientProfile.username || "Usuário");
        setRecipientAvatar(recipientProfile.avatar_url || undefined);
        
        const isOnline = Math.random() > 0.5;
        setOnlineStatus(isOnline ? "online" : "offline");

        // Criar o ID da sala de chat ordenando os IDs dos usuários
        const roomId = [session.user.id, chatId].sort().join('_');
        console.log("ID da sala de chat:", roomId);
        setChatRoomId(roomId);

        await fetchMessages(session.user.id, chatId, roomId);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar conversa");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMessages();

    return () => {
      // Limpar inscrição de canal ao desmontar
      if (chatRoomId) {
        supabase.removeChannel(supabase.channel(chatRoomId));
      }
    };
  }, [chatId, navigate]);

  // Configurar canal de realtime quando chatRoomId estiver disponível
  useEffect(() => {
    if (!chatRoomId) return;

    console.log("Configurando canal realtime para", chatRoomId);
    const channel = supabase
      .channel(`chat-${chatRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatRoomId}`
      }, payload => {
        console.log("Nova mensagem recebida via realtime:", payload);
        const newMessage = payload.new;
        if (newMessage) {
          appendNewMessage(newMessage);
        }
      })
      .subscribe(status => {
        console.log("Status da inscrição do canal:", status);
      });

    return () => {
      console.log("Removendo canal realtime");
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  const fetchMessages = async (userId: string, recipientId: string, roomId: string) => {
    try {
      console.log("Buscando mensagens para o chat:", roomId);
      
      const { data: chatMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', roomId)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error("Erro ao buscar mensagens:", messagesError);
        throw messagesError;
      }
      
      console.log("Mensagens encontradas:", chatMessages?.length || 0);
      
      if (chatMessages) {
        const formattedMessages: MessageType[] = chatMessages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender_id,
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
        
        // Marcar mensagens como lidas
        const unreadMessages = chatMessages
          .filter(msg => msg.sender_id !== userId && !msg.read)
          .map(msg => msg.id);
        
        if (unreadMessages.length > 0) {
          console.log("Marcando mensagens como lidas:", unreadMessages.length);
          const { error: updateError } = await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadMessages);
          
          if (updateError) {
            console.error("Erro ao marcar mensagens como lidas:", updateError);
          }
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      setMessages([]);
      toast.error("Erro ao carregar mensagens anteriores.");
    }
  };

  const appendNewMessage = (messageData: any) => {
    const newMessage: MessageType = {
      id: messageData.id,
      text: messageData.content,
      sender: messageData.sender_id,
      timestamp: new Date(messageData.created_at),
    };
    
    setMessages(prev => {
      // Evitar duplicatas verificando se a mensagem já existe
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!currentUserId || !recipientId || !chatRoomId) {
      console.error("Dados necessários não disponíveis:", { currentUserId, recipientId, chatRoomId });
      toast.error("Não foi possível enviar a mensagem");
      return;
    }
    
    setSending(true);
    console.log("Enviando mensagem para", chatRoomId);
    
    try {
      // Verificar se o chat existe
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chatRoomId)
        .maybeSingle();
        
      // Se o chat não existir, criá-lo
      if (!chatData) {
        console.log("Chat não encontrado, criando novo chat");
        // Criar o chat
        const { data: newChat, error: createChatError } = await supabase
          .from('chats')
          .insert({ id: chatRoomId })
          .select()
          .single();
          
        if (createChatError) {
          console.error("Erro ao criar chat:", createChatError);
          throw new Error("Erro ao criar chat: " + createChatError.message);
        }
        
        // Adicionar participantes
        const { error: participantsError } = await supabase
          .from('chat_participants')
          .insert([
            { chat_id: chatRoomId, user_id: currentUserId },
            { chat_id: chatRoomId, user_id: recipientId }
          ]);
          
        if (participantsError) {
          console.error("Erro ao adicionar participantes:", participantsError);
          throw new Error("Erro ao adicionar participantes: " + participantsError.message);
        }
      }
      
      // Inserir a mensagem
      const messageData = {
        id: uuidv4(),
        chat_id: chatRoomId,
        sender_id: currentUserId,
        content: text,
        created_at: new Date().toISOString(),
        read: false
      };
      
      console.log("Enviando mensagem:", messageData);
      
      const { data: newMessageData, error: messageError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (messageError) {
        console.error("Erro ao enviar mensagem:", messageError);
        throw new Error("Erro ao enviar mensagem: " + messageError.message);
      }
      
      console.log("Mensagem enviada com sucesso:", newMessageData);
      
      const newMessage: MessageType = {
        id: messageData.id,
        text,
        sender: currentUserId,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newMessage]);
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
