
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, Share2, MessageCircle } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import PostsMenu from "@/components/PostsMenu";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  user_has_liked?: boolean;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let { data: posts, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!posts) return;

      if (user) {
        const { data: likes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);

        posts = posts.map(post => ({
          ...post,
          user_has_liked: likes?.some(like => like.post_id === post.id) || false
        }));
      }

      setPosts(posts as Post[]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
      }

      fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
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
                      {post.user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{post.user.username}</span>
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
                    />
                  </div>
                )}

                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <button
                    className="flex items-center gap-2"
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp
                      className={`w-5 h-5 ${
                        post.user_has_liked ? "text-blue-500 fill-current" : "text-gray-500"
                      }`}
                    />
                    <span className="text-sm text-gray-500">{post.likes || 0}</span>
                  </button>

                  <button className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                  </button>

                  <button
                    className="flex items-center"
                    onClick={() => handleShare(post.id)}
                  >
                    <Share2 className="w-5 h-5 text-gray-500" />
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
