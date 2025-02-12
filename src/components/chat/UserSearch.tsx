
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, UserPlus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface NearbyUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  distance: number;
}

interface UserSearchProps {
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}

export const UserSearch = ({ onSelectUser, onClose }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { toast } = useToast();

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([]);
        return;
      }

      try {
        setIsSearching(true);

        // Simulação de um usuário para teste
        const demoUser: NearbyUser = {
          id: "demo-user-id",
          username: "demo_user",
          full_name: "Usuário Demo",
          avatar_url: "",
          distance: 1500 // 1.5km
        };

        // Se a busca incluir "@", procura por username
        if (debouncedSearch.includes("@")) {
          const searchTerm = debouncedSearch.replace("@", "").toLowerCase();
          // Adiciona o usuário demo se corresponder à busca
          if ("demo_user".includes(searchTerm)) {
            setUsers([demoUser]);
          } else {
            setUsers([]);
          }
        } else {
          // Se a busca não incluir "@", procura por nome completo
          const searchTerm = debouncedSearch.toLowerCase();
          if ("usuário demo".includes(searchTerm)) {
            setUsers([demoUser]);
          } else {
            setUsers([]);
          }
        }

      } catch (error: any) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          title: "Erro ao buscar usuários",
          description: "Não foi possível completar a busca",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, toast]);

  const startChat = async (userId: string) => {
    try {
      // Para o usuário demo, simulamos a criação do chat
      if (userId === "demo-user-id") {
        onSelectUser("demo-chat-id");
        onClose();
        toast({
          title: "Chat iniciado",
          description: "Chat de demonstração criado com sucesso!",
        });
        return;
      }

      const { data: chatId, error } = await supabase.rpc('create_private_chat', {
        other_user_id: userId
      });

      if (error) throw error;

      onSelectUser(chatId);
      onClose();
    } catch (error) {
      console.error('Erro ao criar chat:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Não foi possível iniciar a conversa no momento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Input
          placeholder="Digite @ para buscar por username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        {isSearching ? (
          <p className="text-center text-sm text-muted-foreground">Buscando usuários...</p>
        ) : users.length === 0 && searchQuery ? (
          <p className="text-center text-sm text-muted-foreground">Nenhum usuário encontrado</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{user.username} • {(user.distance / 1000).toFixed(1)}km
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startChat(user.id)}
                className="ml-2"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
