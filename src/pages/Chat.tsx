
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Phone,
  Smile,
  Paperclip,
  Mic,
  Home,
  Bell,
  User,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Message, Chat, ChatParticipant } from "@/types/chat";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(
    location.state?.selectedChat || null
  );
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const { data: chats, isLoading: isLoadingChats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      console.log('Fetching chat details:', selectedChat);
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select(`
          *,
          participants:chat_participants(
            user_id,
            profile:profiles(username, avatar_url, name, online_status, last_seen, bio)
          ),
          messages:messages(*)
        `)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        console.error('Chat details error:', chatsError);
        throw chatsError;
      }

      return chatsData as Chat[];
    },
    enabled: !!currentUserId,
    retry: 1,
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      console.log('Fetching messages for chat:', selectedChat);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat)
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Messages fetch error:', error);
        throw error;
      }

      return data as Message[];
    },
    enabled: !!selectedChat,
    retry: 1,
    onError: (error) => {
      console.error('Messages query error:', error);
      toast.error("Erro ao carregar mensagens. Por favor, tente novamente.");
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChat || !currentUserId || !content.trim()) {
        throw new Error("Dados inválidos para enviar mensagem");
      }

      console.log('Sending message:', { content, chatId: selectedChat });
      const { error } = await supabase
        .from("messages")
        .insert({
          chat_id: selectedChat,
          sender_id: currentUserId,
          content: content.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChat] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast.error("Erro ao enviar mensagem. Por favor, tente novamente.");
    },
  });

  useEffect(() => {
    if (!selectedChat) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedChat}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          queryClient.invalidateQueries({ queryKey: ["messages", selectedChat] });
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getCurrentChat = () => {
    if (!selectedChat || !chats) return null;
    return chats.find(c => c.id === selectedChat);
  };

  const getOtherParticipant = (chat: Chat) => {
    return (chat.participants as ChatParticipant[]).find(p => p.user_id !== currentUserId)?.profile;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage);
    }
  };

  if (!selectedChat) {
    navigate("/conversations");
    return null;
  }

  if (isLoadingChats || isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-white">Carregando conversa...</p>
      </div>
    );
  }

  const currentChat = getCurrentChat();
  const otherParticipant = currentChat ? getOtherParticipant(currentChat) : null;

  if (!currentChat || !otherParticipant) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <p className="text-white mb-4">Conversa não encontrada</p>
        <Button 
          onClick={() => navigate("/conversations")}
          variant="secondary"
        >
          Voltar para conversas
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0B141A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5] px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:text-white/80"
              onClick={() => navigate("/conversations")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                  {otherParticipant.avatar_url ? (
                    <img
                      src={otherParticipant.avatar_url}
                      alt={otherParticipant.name || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg text-white">
                      {otherParticipant.name?.[0] || "?"}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1F2C]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  {otherParticipant.name || otherParticipant.username || "Usuário"}
                </h2>
                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white">
            <Phone className="h-5 w-5" />
            <MoreVertical className="h-5 w-5 cursor-pointer" />
          </div>
        </div>
        {/* Bio Section */}
        {otherParticipant.bio && (
          <div className="mt-2 px-14 text-sm text-white/80">
            {otherParticipant.bio}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-gray-400 mb-2">Nenhuma mensagem</p>
            <p className="text-sm text-gray-500">
              Envie uma mensagem para iniciar a conversa
            </p>
          </div>
        ) : (
          messages?.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender_id === currentUserId
                    ? "bg-[#005C4B]"
                    : "bg-[#202C33]"
                }`}
              >
                <p className="break-words text-white">{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-2 bg-[#202C33]">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Smile className="h-6 w-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Paperclip className="h-6 w-6" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mensagem"
            className="flex-1 bg-[#2A3942] border-none text-white placeholder-gray-400"
          />
          {newMessage.trim() ? (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              disabled={sendMessage.isPending}
            >
              <Send className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white bg-green-500 hover:bg-green-600"
            >
              <Mic className="h-6 w-6 text-white" />
            </Button>
          )}
        </div>
      </form>

      {/* Bottom Navigation */}
      <nav className="bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5] py-2 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={() => navigate("/")}
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={() => navigate("/conversations")}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={() => navigate("/notify")}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={() => navigate("/perfil")}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
