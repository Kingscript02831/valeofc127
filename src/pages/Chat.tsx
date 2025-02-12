
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Search, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import type { Chat, Message, ChatParticipant } from "@/types/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatParticipant[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const session = supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    fetchChats();
    subscribeToMessages();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  const fetchChats = async () => {
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select(`
          *,
          participants:chat_participants(
            *,
            profile:profiles(*)
          ),
          messages!messages_chat_id_fkey(*)
        `)
        .order("created_at", { foreignTable: "messages", ascending: true });

      if (chatsError) throw chatsError;

      if (chatsData) {
        setChats(chatsData);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          const chatToUpdate = chats.find(chat => chat.id === newMessage.chat_id);
          
          if (chatToUpdate) {
            const updatedChat = {
              ...chatToUpdate,
              messages: [...chatToUpdate.messages, newMessage],
            };
            setChats(chats.map(chat => 
              chat.id === updatedChat.id ? updatedChat : chat
            ));
            
            if (selectedChat?.id === newMessage.chat_id) {
              setSelectedChat(updatedChat);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const searchUsers = async (query: string) => {
    if (query.startsWith("@")) {
      query = query.substring(1);
    }
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`)
        .limit(5);

      if (error) throw error;

      if (data) {
        setSearchResults(data.map(profile => ({
          id: crypto.randomUUID(),
          user_id: profile.id,
          chat_id: "",
          created_at: new Date().toISOString(),
          last_read_at: new Date().toISOString(),
          profile
        })));
      }
    } catch (error: any) {
      toast({
        title: "Erro ao pesquisar usuários",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startChat = async (participant: ChatParticipant) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-private-chat', {
        body: { otherUserId: participant.user_id }
      });

      if (error) throw error;

      if (data) {
        await fetchChats();
        setSearchQuery("");
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar conversa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          chat_id: selectedChat.id,
          content: message.trim(),
          sender_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      setMessage("");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">
      <Skeleton className="h-12 w-full mb-4" />
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Lista de chats */}
      <div className={`w-full md:w-1/3 bg-white border-r ${selectedChat ? 'hidden md:block' : ''}`}>
        <div className="p-4 border-b">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4 mr-2" />
            Procurar usuários...
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)]">
          {chats.map((chat) => {
            const otherParticipant = chat.participants.find(
              p => p.user_id !== (supabase.auth.getUser())?.data?.user?.id
            );
            const lastMessage = chat.messages[chat.messages.length - 1];

            return (
              <button
                key={chat.id}
                className="w-full p-4 border-b hover:bg-gray-50 text-left"
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={otherParticipant?.profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {otherParticipant?.profile?.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {otherParticipant?.profile?.username || 'Usuário'}
                    </p>
                    {lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {lastMessage && (
                    <span className="text-xs text-gray-400">
                      {format(new Date(lastMessage.created_at), 'HH:mm')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </div>

      {/* Chat selecionado */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-white flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setSelectedChat(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={selectedChat.participants.find(
                  p => p.user_id !== (supabase.auth.getUser())?.data?.user?.id
                )?.profile?.avatar_url || ''}
              />
              <AvatarFallback>
                {selectedChat.participants.find(
                  p => p.user_id !== (supabase.auth.getUser())?.data?.user?.id
                )?.profile?.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="ml-3 font-medium">
              {selectedChat.participants.find(
                p => p.user_id !== (supabase.auth.getUser())?.data?.user?.id
              )?.profile?.username || 'Usuário'}
            </span>
          </div>

          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {selectedChat.messages.map((msg) => {
                const isSender = msg.sender_id === (supabase.auth.getUser())?.data?.user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isSender ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs ${isSender ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-white">
            <form
              className="flex space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Selecione uma conversa para começar</p>
          </div>
        </div>
      )}

      {/* Modal de pesquisa */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procurar usuários</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Digite @ para procurar usuários..."
              className="w-full"
            />
            <div className="space-y-2">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  className="w-full p-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg"
                  onClick={() => startChat(result)}
                >
                  <Avatar>
                    <AvatarImage src={result.profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {result.profile?.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{result.profile?.username}</p>
                    <p className="text-sm text-gray-500">{result.profile?.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
