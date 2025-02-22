
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, Share2, MessageCircle } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import PostsMenu from "@/components/PostsMenu";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  user_has_liked?: boolean;
  comments: Comment[];
  user: {
    username: string;
    avatar_url: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
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
          user:profiles(username, avatar_url),
          comments:post_comments(
            id,
            content,
            created_at,
            user:profiles(username, avatar_url)
          )
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

  const handleComment = async (postId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para comentar",
          variant: "destructive",
        });
        return;
      }

      const content = comments[postId];
      if (!content?.trim()) return;

      await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        content,
      });

      setComments({ ...comments, [postId]: "" });
      fetchPosts();
    } catch (error) {
      console.error("Error commenting:", error);
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
            <Card key={post.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <img
                  src={post.user.avatar_url || "/placeholder.svg"}
                  alt={post.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{post.user.username}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
                {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                  <MediaCarousel
                    images={post.images || []}
                    videoUrls={post.video_urls || []}
                    title={post.content}
                  />
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-0">
                <div className="flex items-center justify-between w-full border-t border-b py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${post.user_has_liked ? "fill-current text-blue-500" : ""}`}
                    />
                    <span className="text-sm">Curtir</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => {
                      const commentInput = document.getElementById(`comment-${post.id}`);
                      if (commentInput) commentInput.focus();
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Comentar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleShare(post.id)}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Compartilhar</span>
                  </Button>
                </div>

                <div className="w-full space-y-4">
                  <div className="flex gap-2">
                    <Input
                      id={`comment-${post.id}`}
                      placeholder="Escreva um comentário..."
                      value={comments[post.id] || ""}
                      onChange={(e) => setComments({
                        ...comments,
                        [post.id]: e.target.value
                      })}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post.id)}
                      disabled={!comments[post.id]?.trim()}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {post.comments?.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted"
                      >
                        <img
                          src={comment.user.avatar_url || "/placeholder.svg"}
                          alt={comment.user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-sm">
                            {comment.user.username}
                          </p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
