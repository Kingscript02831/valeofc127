
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const Search = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-xl mx-auto">
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
                  onClick={() => navigate(`/perfil/${user.username}`)}
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
      </main>
      <BottomNav />
    </div>
  );
};

export default Search;
