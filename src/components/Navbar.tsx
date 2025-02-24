
import { Link, useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import MenuConfig from "./menuconfig";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Navbar = () => {
  const { data: config, isLoading, isError } = useSiteConfig();
  const [showSearch, setShowSearch] = useState(false);
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

  const navigateToProfile = (username: string) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/perfil/${username}`);
  };

  if (isLoading) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-white">Error loading navbar</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full fixed top-0 z-50 shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
              <img 
                src={config.navbar_logo_image} 
                alt="Logo" 
                className="h-12 w-12 rounded-full object-cover"
                style={{ borderColor: config.text_color }}
              />
            ) : (
              <span 
                className="text-3xl font-bold tracking-tighter"
                style={{ color: config.text_color }}
              >
                {config.navbar_title || 'Vale Notícias'}
              </span>
            )}
          </Link>

          <div className="flex items-center space-x-4">
            {/* Plus Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="w-14 h-14 rounded-full bg-gray-100/20 hover:bg-gray-100/30 transition-colors"
                >
                  <Plus className="h-7 w-7" style={{ color: config.text_color }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
              >
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/products/new")}
                >
                  Adicionar Produto
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/posts/new")}
                >
                  Criar Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Icon */}
            <Button
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="w-14 h-14 rounded-full bg-gray-100/20 hover:bg-gray-100/30 transition-colors"
            >
              <Search className="h-7 w-7" style={{ color: config.text_color }} />
            </Button>

            {/* Menu Config */}
            <MenuConfig />
          </div>

          {/* Search Overlay */}
          {showSearch && (
            <div className="absolute top-16 left-0 right-0 bg-background border-b border-border p-4 shadow-lg">
              <Input
                type="text"
                placeholder="Digite @ para buscar usuários..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md mx-auto"
              />
              {searchResults.length > 0 && (
                <div className="max-w-md mx-auto mt-2 bg-background rounded-lg border border-border">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => navigateToProfile(user.username)}
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
