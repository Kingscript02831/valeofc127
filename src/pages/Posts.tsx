
import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, Share2, MessageCircle } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import PostsMenu from "@/components/PostsMenu";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
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

      // Fetch likes
      if (user) {
        const { data: likes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);

        posts = await Promise.all(posts.map(async (post) => {
          // Get comment count
          const { count } = await supabase
            .from("post_comments")
            .select("*", { count: 'exact', head: true })
            .eq("post_id", post.id);

          return {
            ...post,
            comment_count: count || 0,
            user_has_liked: likes?.some(like => like.post_id === post.id) || false
          };
        }));
      }

      return posts as Post[];
    }
  });

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para curtir um post",
          variant: "destructive",
        });
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.user_has_liked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Atualizar contagem de likes no post
        await supabase
          .from("posts")
          .update({ likes: (post.likes || 1) - 1 })
          .eq("id", postId);
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        // Atualizar contagem de likes no post
        await supabase
          .from("posts")
          .update({ likes: (post.likes || 0) + 1 })
          .eq("id", postId);
      }

      refetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua curtida",
        variant: "destructive",
      });
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
          {posts.map((post) => (
            <Card key={post.id} className="shadow-none border-none">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar>
                    <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {post.user.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{post.user.full_name}</span>
                      <span className="text-muted-foreground">@{post.user.username}</span>
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
                  <p className="px-4 py-2">{post.content}</p>
                )}

                {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                  <div className="w-full">
                    <MediaCarousel
                      images={post.images || []}
                      videoUrls={post.video_urls || []}
                      title={post.content || ""}
                      instagramMedia={[]}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <button
                    className="flex items-center gap-2 transition-colors duration-200"
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp
                      className={`w-5 h-5 ${
                        post.user_has_liked 
                          ? "text-blue-500 fill-blue-500" 
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                    />
                    <span className="text-sm text-gray-500">{post.likes || 0}</span>
                  </button>

                  <button className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-gray-500 hover:text-purple-500 transition-colors duration-200" />
                    <span className="text-sm text-gray-500">{post.comment_count || 0}</span>
                  </button>

                  <button
                    className="flex items-center transition-colors duration-200"
                    onClick={() => handleShare(post.id)}
                  >
                    <Share2 className="w-5 h-5 text-gray-500 hover:text-green-500" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
