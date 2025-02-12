import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Settings, Filter, MoreVertical } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { UserSearch } from "./UserSearch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const demoChats: ChatPreview[] = [
      {
        chat_id: "demo-1",
        last_message_content: "Oi! Como vai?",
        last_message_time: new Date().toISOString(),
        other_user_id: "user-1",
        other_user_name: "João Silva",
        other_user_avatar: "",
        unread_count: 2
      },
      {
        chat_id: "demo-2",
        last_message_content: "Vamos marcar algo para o fim de semana?",
        last_message_time: new Date(Date.now() - 3600000).toISOString(),
        other_user_id: "user-2",
        other_user_name: "Maria Oliveira",
        other_user_avatar: "",
        unread_count: 0
      }
    ];
    
    setChats(demoChats);
    setFilteredChats(demoChats);
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
      <div className="p-4 border-b bg-primary">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary-foreground">Conversas</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <Filter className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>Arquivar todas</DropdownMenuItem>
                <DropdownMenuItem>Marcar todas como lidas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Pesquisar conversa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/10 text-primary-foreground placeholder:text-primary-foreground/70"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-primary-foreground/70" />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="shrink-0">
                <UserPlus className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Nova Conversa</SheetTitle>
              </SheetHeader>
              <UserSearch
                onSelectUser={onSelectChat}
                onClose={() => setIsSearchOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList className="p-1 mx-4 my-2">
          <TabsTrigger value="all" className="flex-1">Todas</TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">Não lidas</TabsTrigger>
          <TabsTrigger value="archived" className="flex-1">Arquivadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 overflow-y-auto m-0">
          <div className="divide-y">
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
          </div>
        </TabsContent>

        <TabsContent value="unread" className="flex-1 overflow-y-auto m-0">
          <div className="divide-y">
            {filteredChats.filter(chat => chat.unread_count > 0).map((chat) => (
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
          </div>
        </TabsContent>

        <TabsContent value="archived" className="flex-1 overflow-y-auto m-0">
          <div className="p-8 text-center text-muted-foreground">
            <p>Nenhuma conversa arquivada</p>
          </div>
        </TabsContent>
      </Tabs>

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
  );
};
