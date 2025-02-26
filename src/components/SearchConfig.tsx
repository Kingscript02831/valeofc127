
import { useState } from "react";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchConfigProps {
  onClose?: () => void;
}

const SearchConfig = ({ onClose }: SearchConfigProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();

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

  const handleUserClick = (username: string) => {
    if (onClose) onClose();
    navigate(`/perfil/${username}`);
  };

  return (
    <div className="fixed top-16 right-0 bottom-0 w-72 transform transition-transform duration-300 bg-background dark:bg-background shadow-lg border-l border-border">
      <div className="p-4">
        <Input
          type="text"
          placeholder="Digite @ para buscar usuários..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="mb-4"
          autoFocus
        />
        
        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user.username)}
                className="flex items-center space-x-3 w-full p-3 hover:bg-accent/10 transition-colors rounded-lg"
              >
                <Avatar className="h-10 w-10">
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
    </div>
  );
};

export default SearchConfig;
