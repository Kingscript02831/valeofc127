import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  chat_id: string;
  read: boolean;
}

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [session, setSession] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setSession(session);
      initializeChat(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch || debouncedSearch.length < 3) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${debouncedSearch}%,full_name.ilike.%${debouncedSearch}%`)
        .neq('id', session?.user?.id)
        .limit(10);

      if (error) {
        console.error('Erro na busca:', error);
        return;
      }

      setSearchResults(data || []);
    };

    searchUsers();
  }, [debouncedSearch, session?.user?.id]);

  const initializeChat = async (userId: string) => {
    try {
      const { data: existingChats } = await supabase
        .from('chats')
        .select('id')
        .single();

      let currentChatId;

      if (existingChats) {
        currentChatId = existingChats.id;
      } else {
        const { data: newChat } = await supabase
          .from('chats')
          .insert({})
          .select()
          .single();

        if (newChat) {
          currentChatId = newChat.id;
          await supabase
            .from('chat_participants')
            .insert({
              chat_id: currentChatId,
              user_id: userId
            });
        }
      }

      if (currentChatId) {
        setChatId(currentChatId);
        const { data: initialMessages } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', currentChatId)
          .order('created_at', { ascending: true });

        if (initialMessages) {
          setMessages(initialMessages);
        }

        const channel = supabase
          .channel('public:messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `chat_id=eq.${currentChatId}`
            },
            (payload) => {
              setMessages(current => [...current, payload.new as Message]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
      toast.error('Erro ao carregar o chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !chatId || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          chat_id: chatId,
          sender_id: session.user.id
        });

      if (error) throw error;
      
      setNewMessage("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const startChat = async (otherUserId: string) => {
    try {
      const { data, error } = await supabase.rpc('create_private_chat', {
        other_user_id: otherUserId
      });

      if (error) throw error;

      setChatId(data);
      setIsSearchOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error('Erro ao iniciar chat:', error);
      toast.error('Erro ao iniciar conversa');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-3xl mx-auto p-4 mb-16">
        <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <h1 className="text-lg font-semibold">Chat</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === session?.user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender_id === session?.user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procurar usuários</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Digite o nome ou username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-y-2">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                  onClick={() => startChat(profile.id)}
                >
                  <div className="flex items-center gap-2">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username || profile.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(profile.username?.[0] || profile.full_name?.[0] || "?").toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      {profile.username && (
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Conversar
                  </Button>
                </div>
              ))}
              {searchQuery.length >= 3 && searchResults.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum usuário encontrado
                </p>
              )}
              {searchQuery.length < 3 && (
                <p className="text-center text-muted-foreground py-4">
                  Digite pelo menos 3 caracteres para pesquisar
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Chat;
