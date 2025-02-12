
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  chat_id: string;
  read: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [session, setSession] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);

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

  const initializeChat = async (userId: string) => {
    try {
      // Primeiro, vamos verificar se já existe um chat
      const { data: existingChats } = await supabase
        .from('chats')
        .select('id')
        .single();

      let currentChatId;

      if (existingChats) {
        currentChatId = existingChats.id;
      } else {
        // Se não existir, criamos um novo chat
        const { data: newChat } = await supabase
          .from('chats')
          .insert({})
          .select()
          .single();

        if (newChat) {
          currentChatId = newChat.id;
          // Adicionamos o usuário como participante
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
        // Carregamos as mensagens iniciais
        const { data: initialMessages } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', currentChatId)
          .order('created_at', { ascending: true });

        if (initialMessages) {
          setMessages(initialMessages);
        }

        // Configuramos a subscription para novas mensagens
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-3xl mx-auto p-4 mb-16">
        <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Chat</h1>
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

      <BottomNav />
    </div>
  );
};

export default Chat;
