
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Search, ArrowRight } from "lucide-react";
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
      const postUrl = `${window.location.origin}/posts/${postId}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira este post: ${postUrl}`)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível abrir o WhatsApp para compartilhar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm pb-4">
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
            posts.map((post: Post, index) => (
              <div key={post.id}>
                <Card className="border-none shadow-sm bg-card hover:bg-accent/5 transition-colors duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
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
                      <div className="mt-3">
                        <p className="text-foreground text-[15px] leading-normal">
                          {post.content}
                        </p>
                      </div>
                    )}

                    {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                      <div className="mt-3">
                        <MediaCarousel
                          images={post.images || []}
                          videoUrls={post.video_urls || []}
                          title={post.content || ""}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 gap-4">
                      <div className="flex-1 relative">
                        <button
                          onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                          className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 py-2 rounded-xl flex items-center justify-center gap-2"
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
                        className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm text-muted-foreground">
                          {post.comment_count || 0}
                        </span>
                      </button>

                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 py-2 rounded-xl flex items-center justify-center"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                          <path d="M17.6 6.4C16.8 6.4 16 6.7 15.4 7.2L9 12.2C8.8 12 8.7 11.7 8.5 11.5C8.1 10.8 7.5 10.2 6.8 9.9C6.1 9.5 5.3 9.3 4.5 9.3C3.7 9.3 2.9 9.5 2.2 9.9C1.5 10.2 0.9 10.8 0.5 11.5C0.2 12.2 0 12.9 0 13.7C0 14.5 0.2 15.2 0.5 15.9C0.9 16.6 1.5 17.2 2.2 17.5C2.9 17.9 3.7 18.1 4.5 18.1C5.3 18.1 6.1 17.9 6.8 17.5C7.5 17.2 8.1 16.6 8.5 15.9C8.7 15.7 8.8 15.4 9 15.2L15.4 20.2C16 20.7 16.8 21 17.6 21C18.4 21 19.2 20.7 19.8 20.2C20.5 19.7 21 19 21.2 18.2C21.5 17.4 21.5 16.5 21.2 15.7C21 14.9 20.5 14.2 19.8 13.7C19.2 13.2 18.4 12.9 17.6 12.9C16.8 12.9 16 13.2 15.4 13.7L9 8.7C9.2 8.5 9.3 8.2 9.5 8C9.8 7.3 9.8 6.4 9.5 5.6C9.3 4.8 8.8 4.1 8.1 3.6C7.5 3.1 6.7 2.8 5.9 2.8C5.1 2.8 4.3 3.1 3.7 3.6C3 4.1 2.5 4.8 2.3 5.6C2 6.4 2 7.3 2.3 8.1C2.5 8.9 3 9.6 3.7 10.1C4.3 10.6 5.1 10.9 5.9 10.9C6.7 10.9 7.5 10.6 8.1 10.1L14.5 15.1C14.3 15.3 14.2 15.6 14 15.8C13.7 16.5 13.7 17.4 14 18.2C14.2 19 14.7 19.7 15.4 20.2C16 20.7 16.8 21 17.6 21C18.4 21 19.2 20.7 19.8 20.2C20.5 19.7 21 19 21.2 18.2C21.5 17.4 21.5 16.5 21.2 15.7C21 14.9 20.5 14.2 19.8 13.7C19.2 13.2 18.4 12.9 17.6 12.9"/>
                        </svg>
                      </button>

                      <button
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 py-2 rounded-xl flex items-center justify-center"
                      >
                        <ArrowRight className="w-5 h-5" />
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
