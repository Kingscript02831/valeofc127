
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, Share2, MessageCircle } from "lucide-react";
import PhotoUrlDialog from "@/components/PhotoUrlDialog";
import { useTheme } from "@/components/ThemeProvider";
import { MediaCarousel } from "@/components/MediaCarousel";
import PostsMenu from "@/components/PostsMenu";

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
  const [newPostContent, setNewPostContent] = useState("");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: postsData, error } = await supabase
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

    if (error) {
      toast({
        title: "Erro ao carregar posts",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Fetch likes for current user
    const { data: userLikes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", session.user.id);

    const postsWithLikes = postsData.map(post => ({
      ...post,
      user_has_liked: userLikes?.some(like => like.post_id === post.id) || false,
    }));

    setPosts(postsWithLikes);
  };

  const handleCreatePost = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: session.user.id,
        content: newPostContent,
        images: selectedImages,
        video_urls: selectedVideos,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar post",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Post criado com sucesso!",
      variant: "default",
    });

    setNewPostContent("");
    setSelectedImages([]);
    setSelectedVideos([]);
    fetchPosts();
  };

  const handleLike = async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.user_has_liked) {
      await supabase
        .from("post_likes")
        .delete()
        .match({ user_id: session.user.id, post_id: postId });

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes: p.likes - 1, user_has_liked: false }
          : p
      ));
    } else {
      await supabase
        .from("post_likes")
        .insert({ user_id: session.user.id, post_id: postId });

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes: p.likes + 1, user_has_liked: true }
          : p
      ));
    }
  };

  const handleComment = async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const commentContent = comments[postId];
    if (!commentContent?.trim()) return;

    const { error } = await supabase
      .from("post_comments")
      .insert({
        user_id: session.user.id,
        post_id: postId,
        content: commentContent,
      });

    if (error) {
      toast({
        title: "Erro ao adicionar comentário",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setComments({ ...comments, [postId]: "" });
    fetchPosts();
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({
        title: "Compartilhar post",
        url: `${window.location.origin}/posts/${postId}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PostsMenu />
      <div className="text-foreground p-4 max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Textarea
              placeholder="O que você está pensando?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPhotoDialogOpen(true)}
              >
                Adicionar Foto
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsVideoDialogOpen(true)}
              >
                Adicionar Vídeo
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && !selectedImages.length && !selectedVideos.length}
              >
                Postar
              </Button>
            </div>
          </CardContent>
        </Card>

        {posts.map((post) => (
          <Card key={post.id} className="mb-4">
            <CardHeader className="flex flex-row items-center gap-4">
              <img
                src={post.user.avatar_url || "/placeholder.svg"}
                alt={post.user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{post.user.username}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                <MediaCarousel
                  images={post.images || []}
                  videoUrls={post.video_urls || []}
                  title={post.content}
                />
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex items-center gap-6 w-full">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => handleLike(post.id)}
                >
                  <ThumbsUp
                    className={post.user_has_liked ? "fill-current" : ""}
                  />
                  {post.likes}
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => handleShare(post.id)}
                >
                  <Share2 />
                  Compartilhar
                </Button>
              </div>

              <div className="w-full">
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Escreva um comentário..."
                    value={comments[post.id] || ""}
                    onChange={(e) => setComments({
                      ...comments,
                      [post.id]: e.target.value
                    })}
                  />
                  <Button
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
                        className="w-8 h-8 rounded-full"
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

        <PhotoUrlDialog
          isOpen={isPhotoDialogOpen}
          onClose={() => setIsPhotoDialogOpen(false)}
          onConfirm={(url) => {
            setSelectedImages([...selectedImages, url]);
          }}
          title="Adicionar foto do Dropbox"
        />

        <PhotoUrlDialog
          isOpen={isVideoDialogOpen}
          onClose={() => setIsVideoDialogOpen(false)}
          onConfirm={(url) => {
            setSelectedVideos([...selectedVideos, url]);
          }}
          title="Adicionar vídeo do Dropbox"
        />
      </div>
    </div>
  );
}
