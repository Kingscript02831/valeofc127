import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { MediaCarousel } from "../components/MediaCarousel";
import { useToast } from "../hooks/use-toast";
import { 
  Heart, 
  Reply,
  ChevronDown,
  Flame
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import ReactionMenu from "../components/ReactionMenu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getReactionIcon } from "../utils/emojisPosts";
import Tags from "../components/Tags";

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
  comment_count: number;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  reply_to_id: string | null;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  likes_count: number;
  user_has_liked: boolean;
  replies_count: number;
}

const PostDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data: post, error } = await supabase
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
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...post,
        reaction_type: post.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
        likes: post.post_likes?.length || 0,
        comment_count: post.post_comments?.length || 0
      };
    },
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:user_id (
            username,
            full_name,
            avatar_url
          ),
          comment_likes (
            id,
            user_id
          )
        `)
        .eq('post_id', id)
        .is('reply_to_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const commentsWithCounts = await Promise.all(comments.map(async (comment) => {
        const { count: repliesCount } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('reply_to_id', comment.id);

        return {
          ...comment,
          likes_count: comment.comment_likes?.length || 0,
          user_has_liked: comment.comment_likes?.some(like => like.user_id === currentUser?.id) || false,
          replies_count: repliesCount || 0
        };
      }));

      return commentsWithCounts;
    },
    enabled: !!id,
  });

  const { data: replies, isLoading: isLoadingReplies } = useQuery({
    queryKey: ['replies', id, showReplies],
    queryFn: async () => {
      const repliesData: { [key: string]: Comment[] } = {};
      
      for (const commentId of Object.keys(showReplies)) {
        if (showReplies[commentId]) {
          const { data: commentReplies, error } = await supabase
            .from('post_comments')
            .select(`
              *,
              user:user_id (
                username,
                full_name,
                avatar_url
              ),
              comment_likes (
                id,
                user_id
              )
            `)
            .eq('reply_to_id', commentId)
            .order('created_at', { ascending: true });

          if (!error && commentReplies) {
            repliesData[commentId] = commentReplies.map(reply => ({
              ...reply,
              likes_count: reply.comment_likes?.length || 0,
              user_has_liked: reply.comment_likes?.some(like => like.user_id === currentUser?.id) || false
            }));
          }
        }
      }
      
      return repliesData;
    },
    enabled: Object.values(showReplies).some(value => value)
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.content,
        url: `${window.location.origin}/posts/${id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o post",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = async () => {
    const postUrl = `${window.location.origin}/posts/${id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleReaction = async (reactionType: string) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para reagir a posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingReaction } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', id)
            .eq('user_id', currentUser.id);
        } else {
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', id)
            .eq('user_id', currentUser.id);
        }
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: id,
            user_id: currentUser.id,
            reaction_type: reactionType
          });
      }

      await queryClient.invalidateQueries({ queryKey: ['post', id] });
      setActiveReactionMenu(null);
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Erro",
        description: "O comentário não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          content: newComment.trim(),
          post_id: id,
          user_id: currentUser.id,
          reply_to_id: replyTo
        });

      if (error) throw error;

      setNewComment("");
      setReplyTo(null);
      await queryClient.invalidateQueries({ queryKey: ['comments', id] });
      
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para curtir comentários",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select()
        .eq('comment_id', commentId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingLike) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: currentUser.id
          });
      }

      await queryClient.invalidateQueries({ queryKey: ['comments', id] });
    } catch (error) {
      console.error('Error toggling comment like:', error);
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

  if (isLoadingPost || isLoadingComments || isLoadingReplies) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 px-4 pt-20 pb-24">
          <div className="max-w-xl mx-auto">
            <Card className="animate-pulse p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-muted rounded mb-4"></div>
            </Card>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 px-4 pt-20 pb-24">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
            <Button onClick={() => navigate('/')}>Voltar para o início</Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-xl mx-auto space-y-4">
          <Card className="overflow-hidden bg-white dark:bg-card border-none shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/perfil/${post?.user.username}`)}
                >
                  <AvatarImage src={post?.user.avatar_url} />
                  <AvatarFallback>
                    {post?.user.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{post?.user.full_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(post?.created_at)}
                  </p>
                </div>
              </div>

              {post?.content && (
                <p className="text-foreground mb-4">
                  <Tags content={post.content} />
                </p>
              )}

              {(post?.images?.length > 0 || post?.video_urls?.length > 0) && (
                <MediaCarousel
                  images={post?.images || []}
                  videoUrls={post?.video_urls || []}
                  title={post?.content || ""}
                />
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                <div className="relative">
                  <button
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setActiveReactionMenu(activeReactionMenu === post?.id ? null : post?.id)}
                  >
                    {post?.reaction_type ? (
                      <img 
                        src={getReactionIcon(post.reaction_type)} 
                        alt={post.reaction_type}
                        className="w-5 h-5"
                      />
                    ) : (
                      <img src="/curtidas1.png" alt="Curtir" className="w-5 h-5" />
                    )}
                    <span className={post?.reaction_type ? 'text-blue-500' : 'text-muted-foreground'}>
                      {post?.likes || 0}
                    </span>
                  </button>

                  <ReactionMenu
                    isOpen={activeReactionMenu === post?.id}
                    onSelect={handleReaction}
                    currentReaction={post?.reaction_type}
                  />
                </div>

                <button 
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <img src="/comentario.png" alt="Comentários" className="w-5 h-5" />
                  <span className="text-sm text-muted-foreground">
                    {comments?.length || 0}
                  </span>
                </button>

                <button
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-card border-none shadow-sm">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                placeholder={replyTo ? "Escreva sua resposta..." : "Escreva um comentário..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] bg-gray-100 dark:bg-gray-800 border-none"
              />
              <div className="flex justify-between items-center">
                {replyTo && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setReplyTo(null)}
                  >
                    Cancelar resposta
                  </Button>
                )}
                <Button type="submit">
                  {replyTo ? "Responder" : "Comentar"}
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            {comments?.map((comment) => (
              <Card key={comment.id} className="p-4 bg-white dark:bg-card border-none shadow-sm">
                <div className="flex gap-3">
                  <Avatar 
                    className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/perfil/${comment.user.username}`)}
                  >
                    <AvatarImage src={comment.user.avatar_url} />
                    <AvatarFallback>
                      {comment.user.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold">
                        {comment.user.full_name}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Flame 
                          className={`w-4 h-4 ${
                            comment.user_has_liked ? "text-red-500" : ""
                          }`}
                        />
                        <span>{comment.likes_count || 0}</span>
                      </button>
                      <button
                        onClick={() => setReplyTo(comment.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Responder</span>
                      </button>
                    </div>

                    {showReplies[comment.id] && replies && replies[comment.id] && (
                      <div className="mt-4 space-y-4 pl-8 border-l-2 border-border/40">
                        {replies[comment.id].map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={reply.user.avatar_url} />
                              <AvatarFallback>
                                {reply.user.full_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-semibold text-sm">
                                  {reply.user.full_name}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{reply.content}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <button
                                  onClick={() => handleCommentLike(reply.id)}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Flame 
                                    className={`w-3 h-3 ${
                                      reply.user_has_liked ? "text-red-500" : ""
                                    }`}
                                  />
                                  <span>{reply.likes_count || 0}</span>
                                </button>
                                <button
                                  onClick={() => setReplyTo(comment.id)}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Reply className="w-3 h-3" />
                                  <span>Responder</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostDetails;
