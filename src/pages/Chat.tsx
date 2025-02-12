
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { ChatList } from "@/components/chat/ChatList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [currentView, setCurrentView] = useState<"list" | "chat">("list");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setSession(session);
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
    if (!chatId) return;

    const fetchMessages = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return;
      }

      setMessages(messages || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chatId)
        .eq('read', false)
        .neq('sender_id', session?.user?.id);
    };

    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages(current => [...current, payload.new as Message]);
          if (payload.new.sender_id !== session?.user?.id) {
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, session?.user?.id]);

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

  const handleSelectChat = (selectedChatId: string) => {
    setChatId(selectedChatId);
    setCurrentView("chat");
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
      setCurrentView("chat");
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
                {currentView === "chat" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentView("list")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <MessageCircle className="h-5 w-5" />
                <h1 className="text-lg font-semibold">
                  {currentView === "list" ? "Conversas" : "Chat"}
                </h1>
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

          {currentView === "list" ? (
            <ChatList onSelectChat={handleSelectChat} selectedChatId={chatId} />
          ) : (
            <>
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
            </>
          )}
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
                    <Avatar>
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>
                        {(profile.username?.[0] || profile.full_name?.[0] || "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
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
