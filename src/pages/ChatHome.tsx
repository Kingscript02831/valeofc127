
import { useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";

const ChatHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, full_name")
        .or(`username.ilike.%${query}%, full_name.ilike.%${query}%`)
        .neq('id', session.session?.user.id)
        .limit(5);

      if (error) {
        console.error("Erro na busca:", error);
        toast.error("Erro ao buscar usuários");
        return;
      }

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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Você precisa estar logado para iniciar um chat");
        navigate("/login");
        return;
      }
      
      // Criar/obter chat com o usuário selecionado
      const { data, error } = await supabase.rpc('create_private_chat', {
        other_user_id: userId
      });
      
      if (error) {
        throw error;
      }
      
      // Navegar para o chat
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
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                  {user.full_name && (
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
