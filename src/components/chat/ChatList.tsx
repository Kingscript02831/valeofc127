
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { UserSearch } from "./UserSearch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ChatPreview {
  chat_id: string;
  last_message_content: string;
  last_message_time: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string;
  unread_count: number;
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export const ChatList = ({ onSelectChat, selectedChatId }: ChatListProps) => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filteredChats, setFilteredChats] = useState<ChatPreview[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      const { data: chatsData, error } = await supabase.rpc('get_user_chats');
      
      if (error) {
        console.error('Erro ao buscar chats:', error);
        return;
      }

      setChats(chatsData || []);
      setFilteredChats(chatsData || []);
    };

    fetchChats();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim() === "") {
      setFilteredChats(chats);
      return;
    }

    const searchTerm = debouncedSearch.toLowerCase();
    const filtered = chats.filter(chat => 
      chat.other_user_name.toLowerCase().includes(searchTerm) ||
      chat.last_message_content.toLowerCase().includes(searchTerm)
    );
    setFilteredChats(filtered);
  }, [debouncedSearch, chats]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Pesquisar conversa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <UserPlus className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Buscar usuários próximos</SheetTitle>
              </SheetHeader>
              <UserSearch
                onSelectUser={onSelectChat}
                onClose={() => setIsSearchOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.chat_id}
            className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
              selectedChatId === chat.chat_id ? "bg-muted" : ""
            }`}
            onClick={() => onSelectChat(chat.chat_id)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.other_user_avatar} />
                <AvatarFallback>
                  {chat.other_user_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">
                    {chat.other_user_name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {chat.last_message_time &&
                      formatDistanceToNow(new Date(chat.last_message_time), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.last_message_content || "Nenhuma mensagem"}
                  </p>
                  {chat.unread_count > 0 && (
                    <Badge variant="default" className="ml-2">
                      {chat.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredChats.length === 0 && searchQuery && (
          <div className="p-8 text-center text-muted-foreground">
            <p>Nenhuma conversa encontrada</p>
          </div>
        )}
        {filteredChats.length === 0 && !searchQuery && (
          <div className="p-8 text-center text-muted-foreground">
            <p>Nenhuma conversa ainda</p>
            <p className="text-sm mt-1">
              Use o botão de busca para começar uma conversa
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
