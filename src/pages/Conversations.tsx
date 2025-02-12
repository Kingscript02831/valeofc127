
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import type { Chat, ChatParticipant } from "../types/chat";

export default function Conversations() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("conversations");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUsername(profile.name || profile.username || 'Usuário');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim()) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, name, avatar_url')
          .or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
          .limit(10);

        if (!error && data) {
          setSearchResults(data);
        }
      } else {
        setSearchResults([]);
      }
    };

    searchUsers();
  }, [searchQuery]);

  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select(`
          *,
          participants:chat_participants(
            *,
            profile:profiles(username, avatar_url, name, online_status, last_seen)
          ),
          messages:messages(*)
        `)
        .order('messages.created_at', { foreignTable: 'messages', ascending: false });

      if (chatsError) throw chatsError;
      return chatsData as Chat[];
    },
    enabled: !!currentUserId,
  });

  const handleUserClick = async (userId: string) => {
    const { data: chatId, error } = await supabase
      .rpc('create_private_chat', { other_user_id: userId });

    if (!error && chatId) {
      navigate('/chat', { state: { selectedChat: chatId } });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherParticipant = (chat: Chat) => {
    return (chat.participants as ChatParticipant[]).find(p => p.user_id !== currentUserId)?.profile;
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{username}</h1>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
            >
              <img src="/lovable-uploads/9cea970e-ee86-414d-a1ec-7e9d58d87834.png" alt="Facebook" className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
            >
              <img src="/lovable-uploads/9cea970e-ee86-414d-a1ec-7e9d58d87834.png" alt="Instagram" className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
            >
              <img src="/lovable-uploads/9cea970e-ee86-414d-a1ec-7e9d58d87834.png" alt="Share" className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#202C33] flex text-center border-b border-gray-700">
        <button 
          className={`flex-1 py-4 ${activeTab === 'conversations' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('conversations')}
        >
          Conversas
        </button>
        <button 
          className={`flex-1 py-4 ${activeTab === 'status' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('status')}
        >
          Status
        </button>
        <button 
          className={`flex-1 py-4 ${activeTab === 'reels' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('reels')}
        >
          Reels
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar"
            className="w-full pl-12 pr-4 py-2 bg-[#202C33] border-none rounded-lg text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          <div>
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="px-4 py-3 hover:bg-[#202C33] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
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
                  </div>
                  <div>
                    <h3 className="font-medium">{user.name || user.username}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {chats?.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              const lastMessage = chat.messages?.[0];
              const isOnline = otherParticipant?.online_status;

              return (
                <div
                  key={chat.id}
                  onClick={() => navigate("/chat", { state: { selectedChat: chat.id } })}
                  className="px-4 py-3 hover:bg-[#202C33] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                        {otherParticipant?.avatar_url ? (
                          <img
                            src={otherParticipant.avatar_url}
                            alt={otherParticipant.name || "Avatar"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">
                            {otherParticipant?.name?.[0] || "?"}
                          </span>
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B141A]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {otherParticipant?.name || otherParticipant?.username || "Usuário"}
                          </h3>
                          {lastMessage && (
                            <p className="text-sm text-gray-400 truncate">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {lastMessage && formatTimestamp(lastMessage.created_at)}
                          {isOnline ? (
                            <span className="text-green-500 block">On-line</span>
                          ) : (
                            <span className="text-yellow-500 block">Offline</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white flex flex-col items-center"
          >
            <span className="text-sm">Início</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/conversations")}
            className="text-white flex flex-col items-center"
          >
            <span className="text-sm">Chat</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/notify")}
            className="text-white flex flex-col items-center"
          >
            <span className="text-sm">Notificações</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/perfil")}
            className="text-white flex flex-col items-center"
          >
            <span className="text-sm">Eu</span>
          </Button>
        </div>
      </div>

      {/* Encryption Notice */}
      <div className="p-4 text-center text-sm text-gray-500">
        Suas mensagens pessoais são protegidas com criptografia de ponta a ponta
      </div>
    </div>
  );
}
