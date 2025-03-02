
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import BottomNav from "../components/BottomNav";
import { getReactionIcon } from "../utils/emojisPosts";
import React, { useEffect } from "react";

interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

const PagCurtidas = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: reactions, isLoading, refetch } = useQuery({
    queryKey: ['post-reactions', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('post_reactions')
          .select(`
            *,
            profiles:user_id (
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('post_id', id);

        if (error) {
          console.error('Error fetching reactions:', error);
          throw error;
        }

        console.log("Reactions data:", data);
        
        // Ensure we have valid reaction data
        if (!data || data.length === 0) {
          return [];
        }

        return data as Reaction[];
      } catch (error) {
        console.error('Error in query function:', error);
        return [];
      }
    },
    enabled: !!id,
    staleTime: 0, // Always treat the data as stale to ensure fresh fetches
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window gets focus
  });

  // Force a refetch when the component mounts to ensure we have the latest data
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return (
    <div className="min-h-screen bg-background">
      {/* No Navbar here as requested */}
      <main className="container mx-auto py-8 px-4 pt-6 pb-24">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              Voltar
            </Button>
            <h1 className="text-xl font-bold">Reações</h1>
            <div className="w-10"></div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-3 w-24 bg-muted rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : reactions && reactions.length > 0 ? (
            <div className="space-y-2">
              {reactions.map((reaction) => (
                <Card key={reaction.id} className="p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="cursor-pointer h-12 w-12"
                        onClick={() => navigate(`/perfil/${reaction.profiles.username}`)}
                      >
                        <AvatarImage src={reaction.profiles.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{reaction.profiles.full_name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{reaction.profiles.full_name || 'Usuário'}</p>
                        <p className="text-sm text-muted-foreground">@{reaction.profiles.username || 'usuário'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10">
                      <img
                        src={getReactionIcon(reaction.reaction_type)}
                        alt={reaction.reaction_type}
                        className="w-8 h-8"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p>Nenhuma reação encontrada</p>
            </Card>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PagCurtidas;
