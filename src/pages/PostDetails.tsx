
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MediaCarousel } from "@/components/MediaCarousel";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  MessageCircle, 
  MessageSquareMore, 
  ThumbsUp, 
  Heart, 
  Smile, 
  Frown, 
  Angry,
  Reply,
  ChevronDown,
  Flame
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ReactionMenu from "@/components/ReactionMenu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

interface PostDetails {
  id: string;
  content: string;
  created_at: string;
  images: string[];
  video_urls: string[];
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  comments: Comment[];
  post_likes: PostLike[];
  comment_count: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface PostLike {
  user_id: string;
  reaction_type: string;
}

interface CommentWithLikes extends Comment {
  likes: number;
  user_has_liked: boolean;
  replies_count: number;
}

const PostDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [post, setPost] = useState<PostDetails | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data: post, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          comments:post_comments (
            id,
            content,
            created_at,
            user:user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          ),
          post_likes (
            user_id,
            reaction_type
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (post.comments) {
        const commentIds = post.comments.map((comment: Comment) => comment.id);
        
        const { data: commentLikes } = await supabase
          .from('comment_likes')
          .select('comment_id, user_id')
          .in('comment_id', commentIds);

        const { data: { user: currentUser } } = await supabase.auth.getUser();

        const { data: repliesCounts } = await supabase
          .from('post_comments')
          .select('id, count(*)', { count: 'exact' })
          .in('reply_to_id', commentIds)
          .group('id');

        const commentsWithLikes = post.comments.map((comment: Comment) => {
          const likes = commentLikes?.filter(like => like.comment_id === comment.id).length || 0;
          const userHasLiked = currentUser ? commentLikes?.some(like => 
            like.comment_id === comment.id && like.user_id === currentUser.id
          ) || false : false;
          const repliesCount = repliesCounts?.find(r => r.id === comment.id)?.count || 0;
          
          return {
            ...comment,
            likes,
            user_has_liked: userHasLiked,
            replies_count: parseInt(repliesCount as unknown as string),
          };
        });

        post.comments = commentsWithLikes;
      }

      const { count } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);

      setPost({ ...post, comment_count: count || 0 });
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o post",
        variant: "destructive",
      });
    }
  };

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
      await fetchPost();
      
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
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

  const handleWhatsAppShare = async (postId: string) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para comentar",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("post_comments").insert({
        post_id: id,
        user_id: user.id,
        content: newComment,
      });

      if (error) throw error;

      setNewComment("");
      await fetchPost();
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para curtir comentários",
          variant: "destructive",
        });
        return;
      }

      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        if (insertError) throw insertError;
      }

      await fetchPost();
      
    } catch (error) {
      console.error('Error in comment like handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua ação",
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
      return `Hoje às ${format(date, 'HH:mm')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${format(date, 'HH:mm')}`;
    } else {
      return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="w-5 h-5 text-blue-500" />;
      case 'love':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'haha':
        return <Smile className="w-5 h-5 text-yellow-500" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'sad':
        return <Frown className="w-5 h-5 text-purple-500" />;
      case 'angry':
        return <Angry className="w-5 h-5 text-orange-500" />;
      default:
        return <ThumbsUp className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-xl mx-auto">
          <Card className="overflow-hidden bg-white dark:bg-card border-none shadow-sm">
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {post.user.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{post.user.full_name}</h2>
                    <p className="text-sm text-muted-foreground">@{post.user.username}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </div>

              {post.content && (
                <p className="text-foreground text-[15px] leading-normal">
                  {post.content}
                </p>
              )}
            </div>

            {(post.images?.length > 0 || post.video_urls?.length > 0) && (
              <div className="w-full">
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

            <div className="flex items-center justify-between p-2 mt-2 border-t border-border/40">
              <div className="relative">
                <button
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                >
                  {post.post_likes?.length > 0 ? (
                    <span className="text-blue-500">
                      {getReactionIcon(post.post_likes[0]?.reaction_type)}
                    </span>
                  ) : (
                    <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${post.post_likes?.length > 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                    {post.post_likes?.length || 0}
                  </span>
                </button>

                <div className="relative">
                  <ReactionMenu
                    isOpen={activeReactionMenu === post.id}
                    onSelect={(type) => handleReaction(post.id, type)}
                  />
                </div>
              </div>

              <button 
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {post.comment_count || 0}
                </span>
              </button>

              <button
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                onClick={() => handleWhatsAppShare(post.id)}
              >
                <MessageSquareMore className="w-5 h-5 text-[#25D366]" />
              </button>

              <button
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleShare(post.id)}
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <Textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                Comentar
              </Button>
            </div>

            <div className="space-y-4">
              {post.comments?.map((comment: CommentWithLikes) => (
                <Card key={comment.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {comment.user.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{comment.user.full_name}</p>
                          <p className="text-sm text-muted-foreground">@{comment.user.username}</p>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                        <div className="flex items-center gap-6 mt-2">
                          <button 
                            onClick={() => handleCommentLike(comment.id)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ThumbsUp className={`h-4 w-4 ${comment.user_has_liked ? 'fill-current text-primary' : ''}`} />
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Reply className="h-4 w-4" />
                            <span>Responder</span>
                          </button>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {comment.replies_count > 0 && (
                      <button 
                        className="flex items-center gap-2 ml-12 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Ver {comment.replies_count} {comment.replies_count === 1 ? 'resposta anterior' : 'respostas anteriores'}
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostDetails;
