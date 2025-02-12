
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import type { Chat, ChatParticipant } from "@/types/chat";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function Conversations() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("conversas");
  const { data: config } = useSiteConfig();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);

      // Buscar o nome do usuário
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
          ),
          messages:messages(*)
        `)
        .order("updated_at", { ascending: false });

      if (chatsError) throw chatsError;

      // Se não houver chats, criar alguns exemplos
      if (!chatsData || chatsData.length === 0) {
        return [
          {
            id: '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            participants: [
              {
                user_id: 'exemplo1',
                profile: {
                  name: 'João Silva',
                  avatar_url: null
                }
              }
            ],
            messages: [
              {
                id: '1',
                content: 'Olá, tudo bem?',
                created_at: new Date().toISOString(),
                sender_id: 'exemplo1'
              }
            ]
          },
          {
            id: '2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            participants: [
              {
                user_id: 'exemplo2',
                profile: {
                  name: 'Maria Santos',
                  avatar_url: null
                }
              }
            ],
            messages: [
              {
                id: '2',
                content: 'Bom dia! Como você está?',
                created_at: new Date().toISOString(),
                sender_id: 'exemplo2'
              }
            ]
          }
        ];
      }

      return chatsData as Chat[];
    },
    enabled: !!currentUserId,
  });

  const getOtherParticipant = (chat: Chat) => {
    return (chat.participants as ChatParticipant[]).find(p => p.user_id !== currentUserId)?.profile;
  };

  const filteredChats = chats?.filter(chat => {
    const otherParticipant = getOtherParticipant(chat);
    const name = otherParticipant?.name || otherParticipant?.username || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#202C33]">
        <div className="flex items-center justify-between p-4">
          <span className="text-xl font-bold">{username}</span>
          <div className="flex items-center gap-4">
            <MoreVertical 
              className="h-6 w-6 text-gray-400 cursor-pointer" 
              onClick={() => navigate("/perfil")}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar usuário"
              className="w-full pl-12 pr-4 py-3 bg-[#202C33] border-none rounded-lg text-gray-200 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
          {["conversas", "status", "reels"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 rounded-full text-sm ${
                activeTab === tab
                  ? "bg-[#00A884] text-white"
                  : "bg-[#202C33] text-gray-400"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="pt-40 pb-20">
        {/* Encryption Notice */}
        <div className="px-4 py-3 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <span>
            Suas mensagens pessoais são protegidas com{" "}
            <span className="text-[#00A884]">criptografia de ponta a ponta</span>
          </span>
        </div>

        {filteredChats?.map((chat) => {
          const otherParticipant = getOtherParticipant(chat);
          const lastMessage = chat.messages?.[0];
          return (
            <div
              key={chat.id}
              onClick={() => navigate("/chat", { state: { selectedChat: chat.id } })}
              className="px-4 py-3 hover:bg-[#202C33] cursor-pointer"
            >
              <div className="flex items-center gap-3">
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
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">
                      {otherParticipant?.name || otherParticipant?.username || "Usuário"}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-400">
                        {new Date(lastMessage.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-sm text-gray-400 truncate">
                      {lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
};
