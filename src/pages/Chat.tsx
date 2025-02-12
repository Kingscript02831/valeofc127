
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { Message, Chat, ChatParticipant } from "@/types/chat";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import BottomNav from "@/components/BottomNav";

export default function Chat() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, name, avatar_url")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery && !!currentUserId,
  });

  // Fetch chats
  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select(`
          *,
          participants:chat_participants(
            *,
            profile:profiles(username, avatar_url, name)
          )
        `)
        .order("updated_at", { ascending: false });

      if (chatsError) throw chatsError;
      return chatsData as Chat[];
    },
    enabled: !!currentUserId,
  });

  // Fetch messages for selected chat
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

  // Start new chat mutation
  const startChat = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .rpc("create_private_chat", { other_user_id: userId });

      if (error) throw error;
      return data;
    },
    onSuccess: (chatId) => {
      setSelectedChat(chatId);
      setIsSearching(false);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao iniciar conversa",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
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
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Subscribe to new messages
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
          queryClient.invalidateQueries({ queryKey: ["messages", selectedChat] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, queryClient]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.user_id !== currentUserId)?.profile;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <SubNav />
      <div className="container max-w-4xl mx-auto p-4 pb-20 pt-20">
        <div className="grid grid-cols-1 gap-4">
          {!selectedChat ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Conversas</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSearching(!isSearching)}
                  className="hover:bg-gray-800"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Procurar usuários
                </Button>
              </div>

              {isSearching ? (
                <div className="space-y-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Procurar por @username..."
                    className="bg-transparent border-white text-white"
                  />
                  {searchResults?.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startChat.mutate(user.id)}
                      className="p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt="Avatar"
                              className="w-full h-full rounded-full object-cover"
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {chats?.map((chat) => {
                    const otherParticipant = getOtherParticipant(chat);
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className="p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            {otherParticipant?.avatar_url ? (
                              <img
                                src={otherParticipant.avatar_url}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">
                                {otherParticipant?.name?.[0] || "?"}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {otherParticipant?.name || "Usuário"}
                            </h3>
                            {otherParticipant?.username && (
                              <p className="text-sm text-gray-400">
                                @{otherParticipant.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="h-[calc(100vh-200px)] flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedChat(null)}
                  className="hover:bg-gray-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {getOtherParticipant(chats?.find(c => c.id === selectedChat) as Chat)?.name || "Chat"}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent border-white text-white"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessage.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
