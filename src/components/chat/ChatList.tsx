
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LupaUsuario from "../lupausuario";

type ChatPreview = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  avatar_url?: string;
};

export const ChatList = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserAndChats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Usuário não autenticado");
          return;
        }

        setUserId(session.user.id);
        await fetchChats(session.user.id);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar conversas");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndChats();

    // Setup subscription for real-time updates
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        if (userId) fetchChats(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchChats = async (currentUserId: string) => {
    try {
      // Implementação simplificada para demonstração
      // Em um app real, você faria queries mais complexas com joins
      
      const { data: initialChats, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', currentUserId)
        .limit(10);

      if (error) throw error;

      if (!initialChats) {
        setChats([]);
        return;
      }

      // Transformar os dados para o formato ChatPreview
      const formattedChats: ChatPreview[] = initialChats.map(user => ({
        id: user.id,
        name: user.username || 'Sem nome',
        lastMessage: "Clique para iniciar uma conversa",
        timestamp: new Date(),
        unread: 0,
        avatar_url: user.avatar_url
      }));

      setChats(formattedChats);
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
      toast.error("Erro ao carregar conversas");
    }
  };

  const handleSearchFocus = () => {
    setSearchOpen(true);
  };

  const handleUserSelect = async (username: string) => {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (error || !user) {
        toast.error("Usuário não encontrado");
        return;
      }

      // Verificar se já existe um chat com este usuário
      const chatExists = chats.find(chat => chat.id === user.id);
      
      if (chatExists) {
        // Se já existe, redirecionar para esse chat
        window.location.href = `/chat/${user.id}`;
      } else {
        // Se não existe, adicionar à lista e redirecionar
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          const newChat: ChatPreview = {
            id: user.id,
            name: profile.username || 'Sem nome',
            lastMessage: "Clique para iniciar uma conversa",
            timestamp: new Date(),
            unread: 0,
            avatar_url: profile.avatar_url
          };

          setChats(prev => [newChat, ...prev]);
          window.location.href = `/chat/${user.id}`;
        }
      }
    } catch (error) {
      console.error("Erro ao selecionar usuário:", error);
      toast.error("Erro ao iniciar conversa");
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-[#075E54] text-white p-3">
        <h1 className="text-xl font-bold">WhatsApp</h1>
      </div>
      
      <div className="flex items-center p-2 bg-[#F6F6F6] relative">
        <input
          type="text"
          placeholder="Search or start new chat"
          className="w-full bg-white rounded-full px-4 py-2 text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
        />
        
        {searchOpen && (
          <LupaUsuario 
            onClose={() => setSearchOpen(false)} 
            onSelectUser={handleUserSelect}
          />
        )}
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Carregando conversas...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <Link 
                to={`/chat/${chat.id}`} 
                key={chat.id}
                className="flex items-center p-3 border-b hover:bg-gray-100"
              >
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                  {chat.avatar_url ? (
                    <img src={chat.avatar_url} alt={chat.name} className="w-full h-full object-cover" />
                  ) : (
                    chat.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{chat.name}</span>
                    <span className="text-xs text-gray-500">
                      {chat.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="bg-[#25D366] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Nenhuma conversa encontrada. Use @ para buscar usuários.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
