
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatPreview {
  id: string;
  username: string;
  avatar_url?: string;
  last_message?: string;
  last_time?: string;
  unread?: number;
}

export const ChatList = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Obter usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Sem sessão de usuário");
          setChats([]);
          setLoading(false);
          return;
        }

        console.log("Usuário logado:", session.user.id);
        setCurrentUser(session.user);

        // Buscar chats que o usuário participa
        const { data: participations, error: participationsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', session.user.id);

        if (participationsError) {
          console.error("Erro ao buscar participações:", participationsError);
          throw participationsError;
        }

        console.log("Participações encontradas:", participations?.length || 0);

        if (!participations || participations.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        const chatIds = participations.map(p => p.chat_id);
        console.log("IDs de chat:", chatIds);

        // Para cada chat, encontrar o outro usuário
        const chatPreviews: ChatPreview[] = [];

        for (const chatId of chatIds) {
          try {
            // Encontrar o outro participante
            const { data: otherParticipant, error: otherError } = await supabase
              .from('chat_participants')
              .select('user_id')
              .eq('chat_id', chatId)
              .neq('user_id', session.user.id)
              .single();

            if (otherError) {
              console.error("Erro ao buscar outro participante:", otherError);
              continue;
            }

            // Obter detalhes do outro usuário
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', otherParticipant.user_id)
              .single();

            if (userError) {
              console.error("Erro ao buscar perfil do usuário:", userError);
              continue;
            }

            // Obter última mensagem
            const { data: lastMessage, error: msgError } = await supabase
              .from('messages')
              .select('content, created_at, read')
              .eq('chat_id', chatId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (msgError && msgError.code !== 'PGRST116') {
              console.error("Erro ao buscar última mensagem:", msgError);
            }

            // Contar mensagens não lidas
            const { count: unreadCount, error: unreadError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_id', chatId)
              .eq('read', false)
              .neq('sender_id', session.user.id);

            if (unreadError) {
              console.error("Erro ao contar mensagens não lidas:", unreadError);
            }

            const preview: ChatPreview = {
              id: otherParticipant.user_id,
              username: userData.username || 'Usuário',
              avatar_url: userData.avatar_url,
              last_message: lastMessage?.content || '',
              last_time: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              unread: unreadCount || 0
            };

            chatPreviews.push(preview);
          } catch (error) {
            console.error(`Erro ao processar chat ${chatId}:`, error);
          }
        }

        // Ordenar chats por última mensagem (mais recente primeiro)
        chatPreviews.sort((a, b) => {
          if (!a.last_time) return 1;
          if (!b.last_time) return -1;
          return b.last_time.localeCompare(a.last_time);
        });

        console.log("Previews de chat processados:", chatPreviews.length);
        setChats(chatPreviews);
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
        toast.error("Não foi possível carregar suas conversas");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#075E54]"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="bg-white dark:bg-gray-700 rounded-full p-6 mb-4 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#075E54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhuma conversa ainda</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
          Use a busca acima para encontrar usuários e iniciar conversas.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          to={`/chat/${chat.id}`}
          className="flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-4 overflow-hidden">
              {chat.avatar_url ? (
                <img src={chat.avatar_url} alt={chat.username} className="w-full h-full object-cover" />
              ) : (
                chat.username.charAt(0).toUpperCase()
              )}
            </div>
            {chat.unread > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#25D366] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {chat.unread}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h2 className="font-medium text-gray-900 dark:text-gray-100">{chat.username}</h2>
              {chat.last_time && (
                <span className="text-xs text-gray-500">{chat.last_time}</span>
              )}
            </div>
            {chat.last_message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{chat.last_message}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
