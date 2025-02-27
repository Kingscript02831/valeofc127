
import { useState, useEffect } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createOrGetChat } from "@/utils/supabase";

const ChatHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado para acessar o chat");
        navigate("/login");
        return;
      }
      setCurrentUser(session.user);
    };

    checkAuth();
  }, [navigate]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      if (!currentUser) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Você precisa estar logado para buscar usuários");
          navigate("/login");
          return;
        }
        setCurrentUser(session.user);
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, full_name")
        .or(`username.ilike.%${query}%, full_name.ilike.%${query}%`)
        .neq('id', currentUser.id)
        .limit(5);

      if (error) {
        console.error("Erro na busca:", error);
        toast.error("Erro ao buscar usuários");
        return;
      }

      console.log("Resultados da busca:", data?.length || 0);
      setSearchResults(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao buscar usuários");
    } finally {
      setIsSearching(false);
    }
  };

  const startNewChat = async (userId: string) => {
    try {
      if (!currentUser) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Você precisa estar logado para iniciar um chat");
          navigate("/login");
          return;
        }
        setCurrentUser(session.user);
      }
      
      console.log("Iniciando chat com usuário:", userId);
      
      // Usar a função utilitária para criar ou obter o chat
      await createOrGetChat(currentUser.id, userId);
      
      // Navegar para a página de chat
      navigate(`/chat/${userId}`);
      
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      toast.error("Não foi possível iniciar o chat");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-[#075E54] text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold mb-2">Mensagens</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar usuário para iniciar conversa..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-[#128C7E] text-white placeholder:text-gray-200 border-none rounded-lg"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {searchResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md z-10">
          {searchResults.map((user) => (
            <div 
              key={user.id}
              className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => startNewChat(user.id)}
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.username?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user.username || user.full_name}</p>
                  {user.full_name && user.username && user.full_name !== user.username && (
                    <p className="text-sm text-gray-500">{user.full_name}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-[#075E54]"
                onClick={(e) => {
                  e.stopPropagation();
                  startNewChat(user.id);
                }}
              >
                Conversar
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        <ChatList />
      </div>
    </div>
  );
};

export default ChatHome;
