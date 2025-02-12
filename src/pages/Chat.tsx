
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      await setupChat();
      subscribeToMessages();
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const setupChat = async () => {
    try {
      // Buscar ou criar um chat geral
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .single();

      if (!existingChat) {
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({})
          .select()
          .single();

        if (chatError) throw chatError;

        // Adicionar o usuário atual como participante
        const { error: participantError } = await supabase
          .from('chat_participants')
          .insert({
            chat_id: newChat.id,
            user_id: (await supabase.auth.getUser()).data.user!.id
          });

        if (participantError) throw participantError;
      }

      // Carregar mensagens
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (messagesData) {
        setMessages(messagesData);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar mensagens",
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
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(current => [...current, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        toast({
          title: "Erro ao enviar mensagem",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: userId
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <p>Carregando...</p>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <ScrollArea ref={scrollRef} className="h-full">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender_id === supabase.auth.getUser().data.user?.id
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'bg-white'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs ${
                  msg.sender_id === supabase.auth.getUser().data.user?.id
                    ? 'text-blue-100'
                    : 'text-gray-500'
                } mt-1`}>
                  {format(new Date(msg.created_at), 'HH:mm')}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 bg-white border-t flex gap-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
