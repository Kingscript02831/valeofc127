
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, Share2, MessageCircle } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import PostsMenu from "@/components/PostsMenu";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import ReactionMenu from "@/components/ReactionMenu";
import { Separator } from "@/components/ui/separator";

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
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);

  const { data: posts = [], refetch: refetchPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let { data: posts, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!posts) return [];

      if (user) {
        const { data: likes } = await supabase
          .from("post_likes")
          .select("post_id, reaction_type")
          .eq("user_id", user.id);

        posts = await Promise.all(posts.map(async (post) => {
          const { count } = await supabase
            .from("post_comments")
            .select("*", { count: 'exact', head: true })
            .eq("post_id", post.id);

          const userLike = likes?.find(like => like.post_id === post.id);
          
          return {
            ...post,
            comment_count: count || 0,
            user_has_liked: !!userLike,
            reaction_type: userLike?.reaction_type || null
          };
        }));
      }

      return posts as Post[];
    }
  });

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

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para reagir a um post",
          variant: "destructive",
        });
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.user_has_liked && post.reaction_type === reactionType) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;

        await supabase
          .from("posts")
          .update({ likes: (post.likes || 1) - 1 })
          .eq("id", postId);
      } else {
        const { error } = await supabase
          .from("post_likes")
          .upsert({ 
            post_id: postId, 
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;

        if (!post.user_has_liked) {
          await supabase
            .from("posts")
            .update({ likes: (post.likes || 0) + 1 })
            .eq("id", postId);
        }
      }

      refetchPosts();
    } catch (error) {
      console.error("Error reacting to post:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    } finally {
      setActiveReactionMenu(null);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({
        title: "Compartilhar Post",
        url: `${window.location.origin}/post/${postId}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PostsMenu />
      <div className="container mx-auto p-4 pt-20 pb-24">
        <div className="max-w-xl mx-auto space-y-4">
          {posts.map((post, index) => (
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
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                    <div className="relative">
                      <button
                        className="flex items-center gap-2 transition-colors duration-200 hover:text-primary"
                        onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                        onMouseEnter={() => setActiveReactionMenu(post.id)}
                        onMouseLeave={() => setActiveReactionMenu(null)}
                      >
                        <span className="text-xl">
                          {post.user_has_liked ? (
                            getReactionIcon(post.reaction_type || 'like')
                          ) : (
                            '👍'
                          )}
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

                    <button className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
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
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
