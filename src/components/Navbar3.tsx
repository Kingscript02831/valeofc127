
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Navbar3 = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { data: config, isLoading } = useSiteConfig();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user
  useState(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(profile);
      }
    };
    fetchUser();
  }, []);

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, name, avatar_url")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUser?.id)
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery,
  });

  const handleUserClick = async (userId: string) => {
    // Create or get existing chat
    const { data: chatId, error } = await supabase
      .rpc('create_private_chat', { other_user_id: userId });

    if (!error && chatId) {
      navigate('/chat', { state: { selectedChat: chatId } });
    }
  };

  if (isLoading) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200" />
    );
  }

  return (
    <nav 
      className="w-full fixed top-0 z-50 shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
        borderColor: `${config?.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Search icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearching(!isSearching)}
            className="p-2 hover:bg-primary/20 rounded-full"
            style={{ color: config?.text_color }}
          >
            <Search className="h-6 w-6" strokeWidth={2.5} />
          </Button>

          {/* Center - Logo/Username */}
          <div className="flex-1 flex justify-center">
            <span 
              className="text-2xl font-bold tracking-tighter px-6 py-2 rounded-full"
              style={{ 
                color: config?.text_color,
                backgroundColor: `${config?.primary_color}20`
              }}
            >
              {currentUser?.name || currentUser?.username || 'VALEOFC'}
            </span>
          </div>

          {/* Right side - Spacer for symmetry */}
          <div className="w-10" />
        </div>

        {/* Search results dropdown */}
        {isSearching && searchQuery && (
          <div className="absolute left-0 right-0 top-16 bg-black/95 border-t border-gray-800 max-h-[70vh] overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto p-4">
              {searchResults?.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || "User avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg text-white">
                        {user.name?.[0] || user.username?.[0] || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {user.name || "User"}
                    </h3>
                    {user.username && (
                      <p className="text-sm text-gray-400">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search input overlay */}
        {isSearching && (
          <div className="absolute left-0 right-0 top-0 h-16 bg-black/95 flex items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearching(false);
                setSearchQuery("");
              }}
              className="mr-2"
            >
              <Search className="h-5 w-5 text-white" />
            </Button>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar usuários..."
              className="flex-1 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0"
              autoFocus
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar3;
