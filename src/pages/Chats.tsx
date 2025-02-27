
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent } from "../components/ui/card";
import { format, isToday, isYesterday } from "date-fns";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { MessageCircle } from "lucide-react";

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id || null);
    };
    
    checkSession();
  }, []);

  const { data: chats, isLoading, error } = useQuery({
    queryKey: ["chats", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          updated_at,
          chat_participants!inner(
            id, 
            user_id,
            last_read_at,
            profiles:user_id(
              username,
              avatar_url,
              full_name
            )
          ),
          last_message:messages(
            id,
            content,
            created_at,
            sender_id,
            read
          )
        `)
        .eq('chat_participants.user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error);
        throw error;
      }

      return data.map((chat: any) => ({
        ...chat,
        participants: chat.chat_participants,
        lastMessage: chat.last_message && chat.last_message.length > 0 
          ? chat.last_message[0] 
          : null
      }));
    },
    enabled: !!userId,
  });

  const getOtherParticipant = (chat: any) => {
    return chat.participants.find((p: any) => p.user_id !== userId);
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Ontem";
    } else {
      return format(date, "dd/MM/yyyy");
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Conversas" showBackButton={false} />
        <div className="container py-4">
          <p className="text-center py-8">Carregando conversas...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Conversas" showBackButton={false} />
        <div className="container py-4">
          <p className="text-center py-8 text-destructive">Erro ao carregar conversas.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Conversas" showBackButton={false} />
      <div className="container py-4 pb-20">
        {chats && chats.length > 0 ? (
          <div className="space-y-2">
            {chats.map((chat: any) => {
              const otherParticipant = getOtherParticipant(chat);
              const profile = otherParticipant?.profiles;
              const unreadMessages = chat.lastMessage && 
                chat.lastMessage.sender_id !== userId && 
                !chat.lastMessage.read;
              
              return (
                <Card 
                  key={chat.id} 
                  className={`cursor-pointer ${unreadMessages ? 'bg-primary/5' : ''}`}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <CardContent className="p-3 flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={profile?.avatar_url || '/placeholder.svg'} 
                        alt={profile?.username || 'User'}
                      />
                      <AvatarFallback>
                        {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">
                          {profile?.full_name || profile?.username || 'Usuário'}
                        </p>
                        {chat.lastMessage && (
                          <p className="text-xs text-muted-foreground">
                            {formatMessageDate(chat.lastMessage.created_at)}
                          </p>
                        )}
                      </div>
                      <p className={`text-sm truncate ${unreadMessages ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {chat.lastMessage 
                          ? chat.lastMessage.content 
                          : 'Nenhuma mensagem'}
                      </p>
                    </div>
                    {unreadMessages && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Sem conversas</h3>
            <p className="text-muted-foreground mt-1">
              Você não iniciou nenhuma conversa ainda.
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Chats;
