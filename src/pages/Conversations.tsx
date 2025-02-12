import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import SubNav3 from "@/components/SubNav3";
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
        .order('messages.created_at', { foreignTable: 'messages', ascending: false });

      if (chatsError) throw chatsError;

      if (!chatsData || chatsData.length === 0) {
        const mockChats: Chat[] = [
          {
            id: '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            participants: [{
              id: '1',
              chat_id: '1',
              user_id: 'exemplo1',
              created_at: new Date().toISOString(),
              last_read_at: new Date().toISOString(),
              profile: {
                name: 'João Silva',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=João'
              }
            }],
            messages: [{
              id: '1',
              chat_id: '1',
              content: 'Olá! Como posso te ajudar hoje?',
              created_at: new Date().toISOString(),
              sender_id: 'exemplo1',
              read: false
            }]
          },
          {
            id: '2',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
            participants: [{
              id: '2',
              chat_id: '2',
              user_id: 'exemplo2',
              created_at: new Date().toISOString(),
              last_read_at: new Date().toISOString(),
              profile: {
                name: 'Maria Santos',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
              }
            }],
            messages: [{
              id: '2',
              chat_id: '2',
              content: 'Bom dia! Preciso de informações sobre os horários.',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              sender_id: 'exemplo2',
              read: true
            }]
          },
          {
            id: '3',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            updated_at: new Date(Date.now() - 7200000).toISOString(),
            participants: [{
              id: '3',
              chat_id: '3',
              user_id: 'exemplo3',
              created_at: new Date().toISOString(),
              last_read_at: new Date().toISOString(),
              profile: {
                name: 'Carlos Oliveira',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
              }
            }],
            messages: [{
              id: '3',
              chat_id: '3',
              content: 'Oi, gostaria de saber mais sobre os eventos.',
              created_at: new Date(Date.now() - 7200000).toISOString(),
              sender_id: 'exemplo3',
              read: true
            }]
          }
        ];
        return mockChats;
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
      <Navbar />
      <SubNav3 />
      
      {/* Search Bar */}
      <div className="fixed top-[7.5rem] left-0 right-0 z-40 bg-[#202C33] px-4 py-2">
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

      {/* Chat List */}
      <div className="pt-48 pb-20">
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

        {filteredChats?.length === 0 && searchQuery && (
          <div className="px-4 py-8 text-center text-gray-400">
            Nenhum usuário encontrado com "{searchQuery}"
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
