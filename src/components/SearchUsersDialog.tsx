
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchResult {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function SearchUsersDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .ilike("username", `%${query}%`)
        .limit(10);

      if (!error && data) {
        setResults(data);
      }
    } else {
      setResults([]);
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/perfil/${username}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pesquisar Usuários</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Pesquisar por @username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                onClick={() => handleUserClick(user.username || "")}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>
                    {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">@{user.username}</p>
                  {user.full_name && (
                    <p className="text-sm text-muted-foreground">{user.full_name}</p>
                  )}
                </div>
              </div>
            ))}
            {searchQuery && results.length === 0 && (
              <p className="text-center text-muted-foreground">Nenhum usuário encontrado</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
