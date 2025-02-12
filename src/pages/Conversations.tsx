
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar3 from "@/components/Navbar3";
import SubNav3 from "@/components/SubNav3";
import BottomNav from "@/components/BottomNav";
import type { Chat, ChatParticipant } from "@/types/chat";

export default function Conversations() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
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
            profile:profiles(username, avatar_url, name)
          ),
          messages:messages(*)
        `)
        .order("updated_at", { ascending: false });

      if (chatsError) throw chatsError;
      return chatsData as Chat[];
    },
    enabled: !!currentUserId,
  });

  const getOtherParticipant = (chat: Chat) => {
    return (chat.participants as ChatParticipant[]).find(p => p.user_id !== currentUserId)?.profile;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar3 />
      <SubNav3 />
      <div className="container max-w-4xl mx-auto pb-20 pt-20">
        <div className="relative h-[calc(100vh-160px)] bg-gray-900 rounded-lg overflow-hidden">
          <div className="h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold">Conversas</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/chat", { state: { isSearchOpen: true } })}
                className="hover:bg-gray-800"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-64px)]">
              {chats?.map((chat) => {
                const otherParticipant = getOtherParticipant(chat);
                const lastMessage = chat.messages?.[0];
                return (
                  <div
                    key={chat.id}
                    onClick={() => navigate("/chat", { state: { selectedChat: chat.id } })}
                    className="p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800"
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
                        <h3 className="font-medium">
                          {otherParticipant?.name || otherParticipant?.username || "Usuário"}
                        </h3>
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
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
