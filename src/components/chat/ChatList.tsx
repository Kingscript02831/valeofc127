
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
      // Buscar perfis de usuários para mostrar como conversas
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
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="bg-[#075E54] text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Mensagens</h1>
        <p className="text-xs opacity-75">Converse com seus amigos</p>
      </div>
      
      <div className="flex items-center p-3 bg-white dark:bg-gray-800 shadow-sm relative">
        <input
          type="text"
          placeholder="Digite @ para buscar usuários"
          className="w-full bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
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
          <div className="animate-pulse flex flex-col space-y-4 w-full px-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <Link 
                to={`/chat/${chat.id}`} 
                key={chat.id}
                className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                  {chat.avatar_url ? (
                    <img src={chat.avatar_url} alt={chat.name} className="w-full h-full object-cover" />
                  ) : (
                    chat.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{chat.name}</span>
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
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="mb-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">Nenhuma conversa encontrada</p>
                <p className="text-sm text-gray-400">Digite @ para buscar usuários e iniciar uma conversa</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Botão flutuante para iniciar nova conversa */}
      <div className="fixed bottom-20 right-6">
        <button
          onClick={() => setSearchOpen(true)}
          className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};
