
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, Search, Share2, MessageCircle } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactionMenu from "@/components/ReactionMenu";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  reaction_type?: string;
  created_at: string;
  user_has_liked?: boolean;
  comment_count?: number;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function Posts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', searchTerm],
    queryFn: async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        let query = supabase
          .from('posts')
          .select(`
            *,
            user:user_id (
              username,
              full_name,
              avatar_url
            ),
            post_likes (
              reaction_type,
              user_id
            )
          `)
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.ilike('content', `%${searchTerm}%`);
        }

        const { data: postsData, error } = await query;

        if (error) throw error;

        return (postsData || []).map(post => ({
          ...post,
          reaction_type: post.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
          likes: post.post_likes?.length || 0
        }));
      } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
    }
  });

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para reagir a posts",
          variant: "destructive",
        });
        return;
      }

      const { data: existingReaction } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          const { error: deleteError } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        } else {
          const { error: updateError } = await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (insertError) throw insertError;
      }

      setActiveReactionMenu(null);
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({
        url: `${window.location.origin}/posts/${postId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para sua área de transferência",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm pb-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:scale-105 transition-transform text-foreground"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 rounded-full bg-card/50 backdrop-blur-sm border-none shadow-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
                      </div>
                    </div>
                    <div className="h-24 bg-gray-200 rounded mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            posts?.map((post) => (
              <div key={post.id}>
                <Card className="border-none shadow-sm bg-card hover:bg-accent/5 transition-colors duration-200">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {post.user.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground hover:underline cursor-pointer">
                            {post.user.full_name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            @{post.user.username}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                          })}
                        </p>
                      </div>
                    </div>

                    {post.content && (
                      <div className="px-4 py-2">
                        <p className="text-foreground text-[15px] leading-normal">
                          {post.content}
                        </p>
                      </div>
                    )}

                    {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                      <div className="w-full mt-2">
                        <MediaCarousel
                          images={post.images || []}
                          videoUrls={post.video_urls || []}
                          title={post.content || ""}
                          autoplay={false}
                          showControls={true}
                          cropMode="contain"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                      <div className="relative">
                        <button
                          className="flex items-center gap-2 transition-colors duration-200 hover:text-primary"
                          onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                        >
                          <span className="text-xl">
                            {post.reaction_type ? getReactionIcon(post.reaction_type) : '👍'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {post.likes || 0}
                          </span>
                        </button>
                        
                        <ReactionMenu 
                          isOpen={activeReactionMenu === post.id}
                          onSelect={(type) => handleReaction(post.id, type)}
                        />
                      </div>

                      <button 
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {post.comment_count || 0}
                        </span>
                      </button>

                      <button
                        className="flex items-center transition-colors duration-200 hover:text-primary"
                        onClick={() => handleShare(post.id)}
                      >
                        <Share2 className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
                {index < posts.length - 1 && (
                  <Separator className="my-4 opacity-40" />
                )}
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

const getReactionIcon = (type: string) => {
  switch (type) {
    case 'love':
      return '❤️';
    case 'haha':
      return '😂';
    case 'sad':
      return '😞';
    case 'angry':
      return '🤬';
    default:
      return '👍';
  }
};

