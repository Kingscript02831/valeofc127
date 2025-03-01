
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card } from "../components/ui/card";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { getReactionIcon } from "../utils/emojisPosts";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

interface UserReaction {
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  reaction_type: string;
  created_at: string;
}

const PagCurtidas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post-details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          user:user_id(username, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: allReactions, isLoading: isLoadingReactions } = useQuery({
    queryKey: ['post-reactions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_reactions')
        .select(`
          id,
          reaction_type,
          created_at,
          user:user_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reactions:", error);
        throw error;
      }
      
      // Map the data to the expected format and filter out any entries with missing user data
      const formattedData = data
        .filter(item => item.user && !item.user.error)
        .map(item => ({
          user: {
            id: item.user.id,
            username: item.user.username,
            full_name: item.user.full_name,
            avatar_url: item.user.avatar_url
          },
          reaction_type: item.reaction_type,
          created_at: item.created_at
        }));

      return formattedData as UserReaction[];
    },
  });

  const getReactionTypes = () => {
    if (!allReactions) return [];
    const types = [...new Set(allReactions.map(reaction => reaction.reaction_type))];
    return types;
  };

  const reactionTypes = getReactionTypes();

  const filteredReactions = activeTab === "all"
    ? allReactions
    : allReactions?.filter(reaction => reaction.reaction_type === activeTab);

  if (isLoadingPost || isLoadingReactions) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 px-4 pt-20 pb-24 max-w-lg">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <Skeleton className="h-8 w-40" />
          </div>
          
          <Card className="p-4">
            <Skeleton className="h-10 w-full mb-4" />
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24 max-w-lg">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Reações</h1>
        </div>
        
        <Card className="p-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full flex overflow-x-auto pb-2 scrollbar-hide">
              <TabsTrigger value="all" className="flex-1">
                Todos ({allReactions?.length || 0})
              </TabsTrigger>
              
              {reactionTypes.map(type => (
                <TabsTrigger key={type} value={type} className="flex-1 items-center gap-1">
                  <img 
                    src={getReactionIcon(type)} 
                    alt={type} 
                    className="w-5 h-5 inline-block"
                  />
                  <span className="hidden sm:inline">
                    {allReactions?.filter(r => r.reaction_type === type).length || 0}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {filteredReactions && filteredReactions.length > 0 ? (
                  filteredReactions.map((reaction, index) => (
                    <div 
                      key={`${reaction.user.id}-${index}`} 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/perfil/${reaction.user.username}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={reaction.user.avatar_url} />
                          <AvatarFallback>
                            {reaction.user.full_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{reaction.user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">@{reaction.user.username}</p>
                        </div>
                      </div>
                      <img 
                        src={getReactionIcon(reaction.reaction_type)} 
                        alt={reaction.reaction_type} 
                        className="w-6 h-6"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    Nenhuma reação encontrada
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
};

export default PagCurtidas;
