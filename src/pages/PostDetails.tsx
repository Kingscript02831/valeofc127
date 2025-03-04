<lov-code>
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { MediaCarousel } from "../components/MediaCarousel";
import { useToast } from "../hooks/use-toast";
import { 
  Heart, 
  Reply,
  ChevronDown,
  Flame,
  MoreVertical,
  UserPlus,
  UserCheck,
  Send
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
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getReactionIcon } from "../utils/emojisPosts";
import Tags from "../components/Tags";
import LocationDisplay from "../components/locpost";
import { toast } from "sonner";

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
  reactionsByType?: Record<string, number>;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
    id: string;
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

const CommentText = ({ content, replyToUsername }: { content: string, replyToUsername?: string }) => {
  if (!replyToUsername) return <p className="mt-1">{content}</p>;
  
  const mentionPattern = new RegExp(`@${replyToUsername}`, 'i');
  const parts = content.split(mentionPattern);
  const matches = content.match(mentionPattern);
  
  if (!matches) return <p className="mt-1">{content}</p>;
  
  return (
    <p className="mt-1">
      {parts.map((part, i) => (
        <>
          {part}
          {i < parts.length - 1 && (
            <span className="text-blue-500 font-medium">@{replyToUsername}</span>
          )}
        </>
      ))}
    </p>
  );
};

const PostDetails = () => {
  const { id } = useParams();
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToUsername, setReplyToUsername] = useState<string | null>(null);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [followingUsers, setFollowingUsers] = useState<Record<string, boolean>>({});
  const [reactionsLoading, setReactionsLoading] = useState(true);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  useQuery({
    queryKey: ['userFollowings', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return {};

      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      
      const followingMap: Record<string, boolean> = {};
      if (data) {
        data.forEach(item => {
          followingMap[item.following_id] = true;
        });
      }
      
      setFollowingUsers(followingMap);
      return followingMap;
    },
    enabled: !!currentUser?.id,
  });

  const isFollowing = (userId: string) => {
    return !!followingUsers[userId];
  };

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUser?.id) {
        throw new Error("Você precisa estar logado para seguir usuários");
      }

      const { data, error } = await supabase
        .from('follows')
        .insert([
          { follower_id: currentUser.id, following_id: userId }
        ]);

      if (error) throw error;

      await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            title: 'Novo seguidor',
            message: `@${currentUser.id} começou a seguir você.`,
            type: 'system',
          }
        ]);

      return data;
    },
    onSuccess: (_, userId) => {
      setFollowingUsers(prev => ({...prev, [userId]: true}));
      toast.success("Seguindo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['userFollowings', currentUser?.id] });
    },
    onError: (error) => {
      console.error("Error following user:", error);
      toast.error("Erro ao seguir usuário");
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUser?.id) {
        throw new Error("Você precisa estar logado para deixar de seguir usuários");
      }

      const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      setFollowingUsers(prev => {
        const newState = {...prev};
        delete newState[userId];
        return newState;
      });
      toast.success("Deixou de seguir com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['userFollowings', currentUser?.id] });
    },
    onError: (error) => {
      console.error("Error unfollowing user:", error);
      toast.error("Erro ao deixar de seguir usuário");
    }
  });

  const handleFollowAction = (userId: string) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.id === userId) {
      return;
    }

    const lastActionTime = localStorage.getItem(`followAction_${userId}`);
    const now = Date.now();
    const cooldownPeriod = 30000; // 30 seconds in milliseconds

    if (lastActionTime) {
      const timeSinceLastAction = now - parseInt(lastActionTime);
      if (timeSinceLastAction < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastAction) / 1000);
        toast.error(`Aguarde ${remainingSeconds} segundos antes de alterar o status de seguir novamente.`);
        return;
      }
    }

    localStorage.setItem(`followAction_${userId}`, now.toString());

    if (isFollowing(userId)) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      try {
        setReactionsLoading(true);
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
            ),
            post_reactions (
              reaction_type,
              user_id
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        const reactionsByType: Record<string, number> = {};
        post.post_reactions?.forEach((reaction: any) => {
          if (!reactionsByType[reaction.reaction_type]) {
            reactionsByType[reaction.reaction_type] = 0;
          }
          reactionsByType[reaction.reaction_type]++;
        });

        const userReaction = post.post_reactions?.find((r: any) => r.user_id === currentUser?.id)?.reaction_type;

        setReactionsLoading(false);
        
        return {
          ...post,
          reaction_type: userReaction,
          reactionsByType,
          likes: post.post_reactions?.length || 0,
          comment_count: post.post_comments?.length || 0
        };
      } catch (error) {
        setReactionsLoading(false);
        console.error('Error fetching post:', error);
        return null;
      }
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

  const { data: reactionSummary } = useQuery({
    queryKey: ['post-reactions-summary', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction_type, user:user_id(username, full_name)')
        .eq('post_id', id);

      if (error) throw error;
      
      const reactionGroups: Record<string, {count: number, users: {username: string, full_name: string}[]}> = {};
      
      data.forEach(reaction => {
        if (!reactionGroups[reaction.reaction_type]) {
          reactionGroups[reaction.reaction_type] = {
            count: 0,
            users: []
          };
        }
        
        reactionGroups[reaction.reaction_type].count++;
        reactionGroups[reaction.reaction_type].users.push(reaction.user);
      });
      
      const currentUserReaction = data.find(r => r.user.username === currentUser?.user_metadata?.username);
      
      return {
        total: data.length,
        byType: reactionGroups,
        currentUserReaction: currentUserReaction?.reaction_type
      };
    },
    enabled: !!currentUser && !!id
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.content,
        url: `${window.location.origin}/posts/${id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(`${window.location.origin}/posts/${id}`);
      toastHook({
        title: "Link copiado",
        description: "O link foi copiado para sua área de transferência",
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
      toastHook({
        title: "Erro",
        description: "Você precisa estar logado para reagir a posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('post_reactions')
            .delete()
            .eq('post_id', id)
            .eq('user_id', currentUser.id);
        } else {
          await supabase
            .from('post_reactions')
            .update({ reaction_type: reactionType })
            .eq('post_id', id)
            .eq('user_id', currentUser.id);
        }
      } else {
        await supabase
          .from('post_reactions')
          .insert({
            post_id: id,
            user_id: currentUser.id,
            reaction_type: reactionType
          });
      }

      await queryClient.invalidateQueries({ queryKey: ['post', id] });
      await queryClient.invalidateQueries({ queryKey: ['post-reactions-summary', id] });
      setActiveReactionMenu(null);
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toastHook({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toastHook({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toastHook({
        title: "Erro",
        description: "O comentário não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      let commentContent = newComment.trim();
      if (replyTo && replyToUsername && !commentContent.includes(`@${replyToUsername}`)) {
        commentContent = `@${replyToUsername} ${commentContent}`;
      }
      
      const { error } = await supabase
        .from('post_comments')
        .insert({
          content: commentContent,
          post_id: id,
          user_id: currentUser.id,
          reply_to_id: replyTo
        });

      if (error) throw error;

      setNewComment("");
      setReplyTo(null);
      setReplyToUsername(null);
      await queryClient.invalidateQueries({ queryKey: ['comments', id] });
      
      toastHook({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toastHook({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    }
  };

  const handleReplyClick = (commentId: string, username: string) => {
    setReplyTo(commentId);
    setReplyToUsername(username);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
    window.scrollTo({
      top: document.body.scrollHeight - 200,
      behavior: 'smooth'
    });
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      toastHook({
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
      toastHook({
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
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-32">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-36">
        <div className="max-w-xl mx-auto space-y-4">
          <Card className="overflow-hidden bg-white dark:bg-card border-none shadow-sm">
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500">
                    <Avatar 
                      className="h-12 w-12 border-2 border-white dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/perfil/${post?.user.username}`)}
                    >
                      <AvatarImage src={post?.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {post?.user.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{post?.user.username}</h2>
                    <LocationDisplay userId={post.user_id} defaultCity="GRÃO MOGOL" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentUser && currentUser.id !== post.user.id && (
                    <Button 
                      onClick={() => handleFollowAction(post.user.id)}
                      variant="outline"
                      size="sm"
                      className={`h-10 px-5 rounded-full text-base font-semibold ${
                        isFollowing(post.user.id) 
                          ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white" 
                          : "bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                      }`}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      {isFollowing(post.user.id) ? "Seguindo" : "Seguir"}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                    <MoreVertical size={20} />
                  </Button>
                </div>
              </div>

              {post?.content && (
                <p className="text-foreground text-[15px] leading-normal">
                  <Tags content={post.content} />
                </p>
              )}
            </div>

            {(post?.images?.length > 0 || post?.video_urls?.length > 0) && (
              <div className="w-full">
                <MediaCarousel
                  images={post?.images || []}
                  videoUrls={post?.video_urls || []}
                  title={post?.content || ""}
                  autoplay={false}
                  showControls={true}
                  cropMode="contain"
                />
              </div>
            )}

            {post?.likes > 0 && (
              <div 
                className="flex items-center gap-1 mx-3 my-2"
              >
                <div className="flex -space-x-2 overflow-hidden">
                  {post.reactionsByType && Object.keys(post.reactionsByType).slice(0, 2).map((type, index) => (
                    <img 
                      key={type} 
                      src={getReactionIcon(type)} 
                      alt={type}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800"
                      style={{ zIndex: 3 - index }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {post?.reaction_type && post?.likes > 1 ? (
                    <span>Você e outras {post.likes - 1} pessoas</span>
                  ) : post?.reaction_type ? (
                    <span>Você</span>
                  ) : post?.likes > 0 ? (
                    <span>{post.likes} pessoas</span>
                  ) : null}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-2 mt-2 border-t border-border/40 relative">
              <div className="relative">
                <button
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setActiveReactionMenu(activeReactionMenu === post?.id ? null : post?.id)}
                >
                  {reactionsLoading ? (
                    <div className="w-5 h-5 rounded-full animate-pulse bg-gray-300 dark:bg-gray-600"></div>
                  ) : post?.reaction_type ? (
                    <img 
                      src={getReactionIcon(post.reaction_type)} 
                      alt={post.reaction_type} 
                      className="w-5 h-5"
                      onError={(e) => {
                        console.error(`Failed to load reaction icon: ${getReactionIcon(post.reaction_type)}`);
                        (e.target as HTMLImageElement).src = "/curtidas.png";
                      }}
                    />
                  ) : (
                    <img 
                      src="/curtidas.png" 
                      alt="Curtir" 
                      className="w-5 h-5"
                      onError={(e) => {
                        console.error("Failed to load default like icon");
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'%3E%3C/path%3E%3C/svg%3E";
                      }}
                    />
                  )}
                </button>

                <div className="relative">
                  <ReactionMenu
                    isOpen={activeReactionMenu === post?.id}
                    onSelect={(type) => handleReaction(type)}
                    currentReaction={post?.reaction_type}
                  />
                </div>
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
                    <CommentText content={comment.content} />
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
                        onClick={() => handleReplyClick(comment.id, comment.user.username)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Responder</span>
                      </button>
                      
                      {comment.replies_count > 0 && (
                        <button
                          onClick={() => setShowReplies(prev => ({
                            ...prev,
                            [comment.id]: !prev[comment.id]
                          }))}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 ${showReplies[comment.id] ? "rotate-180" : ""} transition-transform`} />
                          <span>{showReplies[comment.id] ? "Esconder respostas" : `Ver ${comment.replies_count} ${comment.replies_count === 1 ? "resposta" : "respostas"}`}</span>
                        </button>
                      )}
                    </div>

                    {showReplies[comment.id] && replies && replies[comment.id] && (
                      <div className="mt-4 space-y-4 pl-8 border-l-2 border-border/40">
                        {replies[comment.id].map((reply) => {
                          const mentionMatch = reply.content.match(/^@(\w+)/);
                          const mentionedUser = mentionMatch ? mentionMatch[1] : null;
                          
                          return (
                            <div key={reply.id} className="flex gap-3">
                              <Avatar className="w-6 h-6" onClick={() => navigate(`/perfil/${reply.user.username}`)}>
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
                                    {formatDate(reply.
