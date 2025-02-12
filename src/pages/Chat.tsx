
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
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { Message, Chat, ChatParticipant } from "@/types/chat";

export default function Chat() {
  const { toast } = useToast();
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

  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select(`
          *,
          participants:chat_participants(
            *,
            profile:profiles(username, avatar_url, name, bio)
          ),
          messages:messages(*)
        `)
        .order("updated_at", { ascending: false });

      if (chatsError) throw chatsError;
      return chatsData as Chat[];
    },
    enabled: !!currentUserId,
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedChat,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChat || !currentUserId || !content.trim()) return;

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
    onError: () => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
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
        () => {
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

  const currentChat = getCurrentChat();
  const otherParticipant = currentChat ? getOtherParticipant(currentChat) : null;

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

  return (
    <div className="flex flex-col h-screen bg-[#0B141A]">
      {/* Header */}
      <div className="bg-[#202C33] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => navigate("/conversations")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                {otherParticipant?.avatar_url ? (
                  <img
                    src={otherParticipant.avatar_url}
                    alt={otherParticipant.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-white">
                    {otherParticipant?.name?.[0] || "?"}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#202C33]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                {otherParticipant?.name || otherParticipant?.username || "Usuário"}
              </h2>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Phone className="h-5 w-5" />
          <MoreVertical className="h-5 w-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
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
        ))}
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
    </div>
  );
}
