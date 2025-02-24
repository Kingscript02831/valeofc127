
import { useState } from "react";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface LupaUsuarioProps {
  onClose: () => void;
  onSelectUser: (username: string) => void;
}

const LupaUsuario = ({ onClose, onSelectUser }: LupaUsuarioProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.startsWith("@")) {
      const searchTerm = query.substring(1);
      if (searchTerm.length > 0) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, full_name")
          .ilike("username", `${searchTerm}%`)
          .limit(5);

        if (error) {
          console.error("Erro na busca:", error);
          return;
        }

        setSearchResults(data || []);
      } else {
        setSearchResults([]);
      }
    }
  };

  return (
    <div className="absolute top-16 left-0 right-0 bg-background border-b border-border p-4 shadow-lg">
      <Input
        type="text"
        placeholder="Digite @ para buscar usuários..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-md mx-auto"
        autoFocus
      />
      {searchResults.length > 0 && (
        <div className="max-w-md mx-auto mt-2 bg-background rounded-lg border border-border">
          {searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelectUser(user.username);
                onClose();
              }}
              className="flex items-center space-x-3 w-full p-3 hover:bg-accent/10 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">
                  {user.full_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LupaUsuario;
