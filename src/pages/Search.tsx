
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
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
    <div className="min-h-screen bg-[#000000e6]">
      <main className="container mx-auto py-4 px-4">
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" strokeWidth={2} />
            <Input
              type="text"
              placeholder="Pesquisar"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-[#1A1F2C] text-gray-400 border-none rounded-full h-12"
              autoFocus
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-2 mt-4">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => navigate(`/perfil/${user.username}`)}
                  className="flex items-center space-x-3 w-full p-3 hover:bg-gray-800/50 transition-colors rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium text-white">{user.username}</p>
                    <p className="text-sm text-gray-400">
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
