
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { MediaCarousel } from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReactionMenu from "@/components/ReactionMenu";
import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getReactionIcon } from "@/utils/emojisPosts";
import Tags from "@/components/Tags";
import { sendLikeNotification } from "@/services/notificationService";

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  birthdate?: string;
  location?: string;
  bio?: string;
}

interface Post {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  view_count: number;
  user_has_liked?: boolean;
  reaction_type?: string;
  comment_count: number;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

const Posts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reactionMenu, setReactionMenu] = useState<string | null>(null);
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

      return data.map(post => ({
        ...post,
        reaction_type: post.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
        likes: post.post_likes?.length || 0,
        comment_count: post.post_comments?.length || 0
      }));
    },
    enabled: !!currentUser
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUser?.id,
          following_id: userId
        });
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast({
        title: 'Seguindo',
        description: 'Você começou a seguir este usuário',
      });
    },
    onError: (error) => {
      console.error('Follow error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível seguir este usuário',
        variant: 'destructive',
      });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser?.id)
        .eq('following_id', userId);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast({
        title: 'Deixou de seguir',
        description: 'Você deixou de seguir este usuário',
      });
    },
    onError: (error) => {
      console.error('Unfollow error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deixar de seguir este usuário',
        variant: 'destructive',
      });
    }
  });

  const { data: followingList } = useQuery({
    queryKey: ['following'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser?.id);
      
      if (error) {
        throw error;
      }
      
      return data.map(item => item.following_id);
    },
    enabled: !!currentUser
  });

  const isFollowing = (userId: string) => {
    return followingList?.includes(userId) || false;
  };

  const handleFollowAction = (userId: string) => {
    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para seguir um usuário',
        variant: 'destructive',
      });
      return;
    }

    if (isFollowing(userId)) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const handleRecordView = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      // Check if the user has already viewed this post
      const { data: existingView } = await supabase
        .from('post_views')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      // If no existing view, record it
      if (!existingView) {
        await supabase
          .from('post_views')
          .insert({
            post_id: postId,
            user_id: currentUser.id
          });
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const handleReactionSelect = async (postId: string, reactionType: string) => {
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
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();

      // Find the post to get the owner ID
      const post = posts?.find(p => p.id === postId);
      if (!post) return;

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);
        } else {
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);
            
          // Enviar notificação de curtida quando não está removendo uma reação existente
          sendLikeNotification(postId, post.user.id);
        }
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id,
            reaction_type: reactionType
          });
          
        // Enviar notificação de curtida
        sendLikeNotification(postId, post.user.id);
      }

      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      setReactionMenu(null);
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
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

  const handleShare = async (post: Post) => {
    try {
      await navigator.share({
        title: post.content,
        url: `${window.location.origin}/posts/${post.id}`,
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

  const handleWhatsAppShare = (post: Post) => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-xl mx-auto space-y-6">
          {!currentUser && (
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <h2 className="text-lg font-semibold">Faça login para ver posts</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Crie uma conta ou faça login para ver conteúdo.
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <Button onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline"
                >
                  Criar conta
                </Button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <>
              {[1, 2, 3].map((item) => (
                <div 
                  key={item} 
                  className="bg-card rounded-xl overflow-hidden shadow animate-pulse"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-muted"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="h-52 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div 
                    key={post.id} 
                    className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/perfil/${post.user.username}`)}
                          >
                            <AvatarImage src={post.user.avatar_url} />
                            <AvatarFallback>
                              {post.user.full_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="font-semibold">{post.user.full_name}</h2>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(post.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        {currentUser && currentUser.id !== post.user.id && (
                          <Button 
                            onClick={() => handleFollowAction(post.user.id)}
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3"
                            disabled={followMutation.isPending || unfollowMutation.isPending}
                          >
                            {isFollowing(post.user.id) ? 'Seguindo' : 'Seguir'}
                          </Button>
                        )}
                      </div>

                      {post.content && (
                        <p className="text-foreground mb-4">{post.content}</p>
                      )}

                      {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                        <div onClick={() => handleRecordView(post.id)}>
                          <Link to={`/posts/${post.id}`}>
                            <MediaCarousel
                              images={post.images || []}
                              videoUrls={post.video_urls || []}
                              title={post.content || ""}
                            />
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 border-t border-border/40">
                      <div className="relative">
                        <button
                          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setReactionMenu(reactionMenu === post.id ? null : post.id)}
                        >
                          {post.reaction_type ? getReactionIcon(post.reaction_type) : (
                            <img src="/curtidas.png" alt="Curtir" className="w-5 h-5" />
                          )}
                          <span className={post.reaction_type ? 'text-blue-500' : 'text-muted-foreground'}>
                            {post.likes || 0}
                          </span>
                        </button>

                        <ReactionMenu
                          isOpen={reactionMenu === post.id}
                          onSelect={(reaction) => handleReactionSelect(post.id, reaction)}
                          currentReaction={post.reaction_type}
                        />
                      </div>

                      <Link 
                        to={`/posts/${post.id}`}
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleRecordView(post.id)}
                      >
                        <img src="/comentario.png" alt="Comentários" className="w-5 h-5" />
                        <span className="text-sm text-muted-foreground">
                          {post.comment_count || 0}
                        </span>
                      </Link>

                      <button
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                        onClick={() => handleWhatsAppShare(post)}
                      >
                        <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                      </button>

                      <button
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleShare(post)}
                      >
                        <img src="/compartilharlink.png" alt="Compartilhar" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8">
                  <h2 className="text-xl font-semibold mb-2">Nenhum post encontrado</h2>
                  <p className="text-muted-foreground">
                    Seja o primeiro a compartilhar algo interessante!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Posts;
