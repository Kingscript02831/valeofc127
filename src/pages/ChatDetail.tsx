
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Message, ChatParticipant } from "../types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { format } from "date-fns";
import { Send, ArrowLeft } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const ChatDetail: React.FC = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id || null);
    };
    
    checkSession();
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, queryClient]);

  // Mark messages as read when opening the chat
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!chatId || !userId) return;

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .eq('read', false);

      // Update last_read_at for the participant
      await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    };

    markMessagesAsRead();
  }, [chatId, userId, queryClient]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: chat, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId) throw new Error("Chat ID is required");
      
      // Fetch chat details and participants
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          updated_at,
          chat_participants(
            id,
            user_id,
            last_read_at,
            profiles:user_id(
              id,
              username,
              avatar_url,
              full_name
            )
          )
        `)
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      return {
        ...chatData,
        participants: chatData.chat_participants,
        messages: messagesData
      };
    },
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!chatId || !userId || !content.trim()) 
        throw new Error("Missing required data");

      const newMessage = {
        chat_id: chatId,
        sender_id: userId,
        content: content.trim(),
        read: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const getOtherParticipant = (): ChatParticipant | undefined => {
    if (!chat || !userId) return undefined;
    return chat.participants.find(p => p.user_id !== userId);
  };

  const otherParticipant = getOtherParticipant();
  const messages = chat?.messages || [];

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="border-b p-3 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-2">Carregando...</div>
        </header>
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-center py-8">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  if (!chat || !otherParticipant) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="border-b p-3 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-2">Erro</div>
        </header>
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-center py-8 text-destructive">Conversa não encontrada.</p>
        </div>
      </div>
    );
  }

  const profile = otherParticipant.profiles;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b p-3 flex items-center sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/chats")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center ml-2">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage 
              src={profile?.avatar_url || '/placeholder.svg'} 
              alt={profile?.username || 'User'} 
            />
            <AvatarFallback>
              {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {profile?.full_name || profile?.username || 'Usuário'}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm text-center">
              Nenhuma mensagem ainda. Diga oi!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message: Message) => {
              const isCurrentUser = message.sender_id === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[80%]">
                    <Card className={`p-3 ${
                      isCurrentUser 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted rounded-bl-none'
                    }`}>
                      <p className="text-sm break-words">{message.content}</p>
                    </Card>
                    <span className="text-xs text-muted-foreground mt-1 px-1">
                      {format(new Date(message.created_at), "HH:mm")}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage} 
        className="border-t p-3 flex items-center sticky bottom-0 bg-background"
      >
        <Input
          type="text"
          placeholder="Mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 mr-2"
        />
        <Button 
          type="submit" 
          variant="default" 
          size="icon" 
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatDetail;
