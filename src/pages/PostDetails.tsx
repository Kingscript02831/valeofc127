import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import MediaCarousel from "@/components/MediaCarousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircle,
  SendHorizontal,
  ThumbsUp,
  MoreVertical,
  Trash2,
  Edit,
  Share2,
  Reply,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ReactionMenu from "@/components/ReactionMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getReactionIcon } from "@/utils/emojisPosts";
import { Textarea } from "@/components/ui/textarea";
import Tags from "@/components/Tags";
import { useUser } from "@/hooks/useUser";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes_count: number;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  comments: Comment[];
  user_has_liked: boolean;
  user_reaction_type: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

const PostDetails = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const currentUserId = user?.id;

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
      fetchComments(postId);
    }
  }, [postId]);

  const fetchPost = async (postId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:user_id (
            username,
            full_name,
            avatar_url
          ),
          comments:post_comments(
            id,
            user_id,
            post_id,
            content,
            created_at,
            user:user_id (
              username,
              full_name,
              avatar_url
            )
          ),
          post_likes(reaction_type, user_id)
        `
        )
        .eq("id", postId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const postLikes = data.post_likes || [];
        const userHasLiked = postLikes.some(
          (like) => like.user_id === currentUserId
        );
        const userReactionType = userHasLiked
          ? postLikes.find((like) => like.user_id === currentUserId)
              ?.reaction_type || null
          : null;

        const likesCount = postLikes.length;

        setPost({
          ...data,
          likes_count: likesCount,
          user_has_liked: userHasLiked,
          user_reaction_type: userReactionType,
        } as Post);
      }
    } catch (error: any) {
      console.error("Error fetching post:", error.message);
      toast({
        title: "Erro ao carregar a publicação",
        description: "Não foi possível carregar os detalhes da publicação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select(
          `
          *,
          user:user_id (
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setComments(data as Comment[]);
    } catch (error: any) {
      console.error("Error fetching comments:", error.message);
      toast({
        title: "Erro ao carregar os comentários",
        description: "Não foi possível carregar os comentários da publicação.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      const reactionType = selectedReaction || "like";

      const { error } = await supabase.rpc("toggle_like", {
        post_id_param: post.id,
        user_id_param: currentUserId,
        reaction_type_param: reactionType,
      });

      if (error) {
        throw error;
      }

      fetchPost(postId);
      setSelectedReaction(null);
      setIsReactionMenuOpen(false);
    } catch (error: any) {
      console.error("Error liking post:", error.message);
      toast({
        title: "Erro ao curtir a publicação",
        description: "Não foi possível curtir a publicação.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert([
          {
            post_id: postId,
            user_id: currentUserId,
            content: commentContent,
          },
        ])
        .select(
          `
          *,
          user:user_id (
            username,
            full_name,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        throw error;
      }

      setComments([data as Comment, ...comments]);
      setCommentContent("");
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Publicação excluída",
        description: "A publicação foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error("Error deleting post:", error.message);
      toast({
        title: "Erro ao excluir publicação",
        description: "Não foi possível excluir a publicação.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${format(date, "HH:mm")}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${format(date, "HH:mm")}`;
    } else {
      return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para sua área de transferência",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const postUrl = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl mx-auto pt-20 pb-24 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-[40vh]">
            <p className="text-gray-500">Carregando publicação...</p>
          </div>
        ) : post ? (
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {post.user.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{post.user.full_name}</h2>
                        <p className="text-sm text-muted-foreground">
                          @{post.user.username}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  {post.user_id === currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDeletePost}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {post.content && (
                  <p className="mt-3 text-foreground text-[15px] leading-normal">
                    <Tags content={post.content} />
                  </p>
                )}

                {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                  <div className="mt-4">
                    <MediaCarousel
                      images={post.images}
                      videoUrls={post.video_urls}
                      title={post.content || ""}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                  <button
                    onClick={handleLike}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl ${
                      post.user_has_liked
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    } transition-colors`}
                  >
                    {post.user_reaction_type ? (
                      <span className="text-xl">
                        {getReactionIcon(post.user_reaction_type)}
                      </span>
                    ) : (
                      <img src="/curtidas.png" alt="Curtir" className="w-5 h-5" />
                    )}
                    <span
                      className={`text-sm ${
                        post.user_has_liked
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {post.likes_count || 0}
                    </span>
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => inputRef.current?.focus()}
                  >
                    <img src="/comentario.png" alt="Comentar" className="w-5 h-5" />
                    <span className="text-sm text-muted-foreground">
                      {comments.length || 0}
                    </span>
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                    onClick={handleWhatsAppShare}
                  >
                    <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleShare}
                  >
                    <img src="/compartilharlink.png" alt="Compartilhar" className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  ref={inputRef}
                  placeholder="Adicionar um comentário..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  className="resize-none border-none shadow-sm focus-visible:ring-0"
                />
                <Button onClick={handleAddComment} size="sm">
                  Enviar
                </Button>
              </div>

              {comments.map((comment) => (
                <Card key={comment.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage
                          src={comment.user.avatar_url || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {comment.user.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold">{comment.user.full_name}</h2>
                          <p className="text-sm text-muted-foreground">
                            @{comment.user.username}
                          </p>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[40vh]">
            <p className="text-gray-500">Publicação não encontrada.</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default PostDetails;
