
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, Search, Share2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactionMenu from "@/components/ReactionMenu";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  created_at: string;
  images: string[];
  video_urls: string[];
  likes: number;
  reaction_type?: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  comments_count: number;
}

const Posts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          post_likes (
            reaction_type,
            user_id
          ),
          post_comments (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return postsData.map((post: any) => ({
        ...post,
        likes: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        reaction_type: post.post_likes?.find((like: any) => like.user_id === user?.id)?.reaction_type
      }));
    }
  });

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para reagir",
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
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', user.id);
        }
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      setActiveReactionMenu(null);
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await navigator.share({
        title: post.content,
        url: `${window.location.origin}/posts/${post.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para sua área de transferência",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-9"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-xl mx-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            posts?.map((post: Post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/perfil/${post.user.id}`)}>
                      <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {post.user.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold hover:underline cursor-pointer" onClick={() => navigate(`/perfil/${post.user.id}`)}>
                        {post.user.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(post.created_at), "d 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div onClick={() => navigate(`/posts/${post.id}`)} className="cursor-pointer">
                    {post.content && (
                      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                    )}

                    {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                      <div className="-mx-4">
                        <MediaCarousel
                          images={post.images || []}
                          videoUrls={post.video_urls || []}
                          title={post.content || ""}
                        />
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <button
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                      >
                        <span className="text-xl">
                          {post.reaction_type ? getReactionEmoji(post.reaction_type) : '👍'}
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

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {post.comments_count || 0}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleShare(post)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

const getReactionEmoji = (type: string) => {
  switch (type) {
    case 'like':
      return '👍';
    case 'love':
      return '❤️';
    case 'haha':
      return '😂';
    case 'sad':
      return '😢';
    case 'angry':
      return '😠';
    default:
      return '👍';
  }
};

export default Posts;
