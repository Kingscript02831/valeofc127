
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { Message, Chat, ChatParticipant } from "@/types/chat";
import Navbar4 from "@/components/Navbar4";
import SubNav4 from "@/components/SubNav4";
import BottomNav from "@/components/BottomNav";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(location.state?.isSearchOpen || false);
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

  const { data: searchResults } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, name, avatar_url, bio")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery && !!currentUserId,
  });

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

  const startChat = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .rpc("create_private_chat", { other_user_id: userId });

      if (error) throw error;
      return data;
    },
    onSuccess: (chatId) => {
      setSelectedChat(chatId);
      setIsSearchOpen(false);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: () => {
      toast({
        title: "Erro ao iniciar conversa",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
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

  if (!selectedChat && !isSearchOpen) {
    navigate("/conversations");
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar4 user={otherParticipant} />
      <SubNav4 bio={otherParticipant?.bio} />
      
      <div className="container max-w-4xl mx-auto pb-20 pt-20">
        <div className="relative h-[calc(100vh-160px)] bg-gray-900 rounded-lg overflow-hidden">
          {isSearchOpen ? (
            <div className="h-full p-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Procurar usuários..."
                className="mb-4 bg-gray-800 border-gray-700 text-white"
                autoFocus
              />

              <div className="space-y-2">
                {searchResults?.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startChat.mutate(user.id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name || "Avatar"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {user.name?.[0] || user.username?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {user.name || "Usuário"}
                      </h3>
                      {user.username && (
                        <p className="text-sm text-gray-400">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
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
                          ? "bg-blue-600"
                          : "bg-gray-700"
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
