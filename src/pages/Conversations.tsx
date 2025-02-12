
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
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">{username}</h1>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar"
            className="w-full pl-12 pr-4 py-2"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          <div>
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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

              return (
                <div
                  key={chat.id}
                  onClick={() => navigate("/chat", { state: { selectedChat: chat.id } })}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                        <div>
                          <h3 className="font-medium">
                            {otherParticipant?.name || otherParticipant?.username || "Usuário"}
                          </h3>
                          {lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
