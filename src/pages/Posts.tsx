import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { MediaCarousel } from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import ReactionMenu from "../components/ReactionMenu";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getReactionIcon } from "../utils/emojisPosts";
import Tags from "../components/Tags";
import { Button } from "../components/ui/button";
import { UserPlus, UserCheck, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import LocationDisplay from "../components/locpost";
import StoriesBar from "../components/StoriesBar";

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

const Posts: React.FC = () => {
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Record<string, boolean>>({});
  const [reactionsLoading, setReactionsLoading] = useState(true);

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

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        setReactionsLoading(true);
        let query = supabase
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
          .order('created_at', { ascending: false });

        const { data: postsData, error } = await query;
        if (error) throw error;

        const postsWithCounts = postsData?.map(post => {
          const reactionsByType: Record<string, number> = {};
          post.post_reactions?.forEach((reaction: any) => {
            if (!reactionsByType[reaction.reaction_type]) {
              reactionsByType[reaction.reaction_type] = 0;
            }
            reactionsByType[reaction.reaction_type]++;
          });

          const userReaction = post.post_reactions?.find((r: any) => r.user_id === currentUser?.id)?.reaction_type;

          return {
            ...post,
            reaction_type: userReaction,
            reactionsByType,
            likes: post.post_reactions?.length || 0,
            comment_count: post.post_comments?.length || 0
          };
        });

        setReactionsLoading(false);
        return postsWithCounts;
      } catch (error) {
        setReactionsLoading(false);
        console.error('Error fetching posts:', error);
        return [];
      }
    },
  });

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

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toastHook({
          title: "Erro",
          description: "Você precisa estar logado para reagir a posts",
          variant: "destructive",
        });
        return;
      }

      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          const { error: deleteError } = await supabase
            .from('post_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        } else {
          const { error: updateError } = await supabase
            .from('post_reactions')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (insertError) throw insertError;
      }

      setActiveReactionMenu(null);
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toastHook({
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
      toastHook({
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

  return (
    <div className="bg-white dark:bg-background min-h-screen pb-16">
      <Navbar />
      <div className="container max-w-3xl mx-auto px-0 sm:px-4">
        <div className="mb-2 pt-2">
          <StoriesBar />
        </div>
        <div className="max-w-xl mx-auto space-y-4">
          <div className="h-px bg-gray-200 dark:bg-gray-800 w-full my-2"></div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
                      </div>
                    </div>
                    <div className="h-24 bg-gray-200 rounded mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            posts?.map((post: Post) => (
              <Card key={post.id} className="overflow-hidden bg-white dark:bg-card border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500">
                          <Avatar 
                            className="h-12 w-12 border-2 border-white dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/perfil/${post.user.username}`)}
                          >
                            <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {post.user.full_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">{post.user.username}</h2>
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

                    {post.content && (
                      <p className="text-foreground text-[15px] leading-normal">
                        <Tags content={post.content} />
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

                  <div className="flex items-center justify-between p-2 mt-2 border-t border-border/40 relative">
                    <div className="relative">
                      <button
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                      >
                        {reactionsLoading ? (
                          <div className="w-5 h-5 rounded-full animate-pulse bg-gray-300 dark:bg-gray-600"></div>
                        ) : post.reaction_type ? (
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
                          isOpen={activeReactionMenu === post.id}
                          onSelect={(type) => handleReaction(post.id, type)}
                          currentReaction={post.reaction_type}
                        />
                      </div>
                    </div>

                    {post.likes > 0 && (
                      <div 
                        className="flex items-center gap-1 cursor-pointer absolute left-0 -top-7 bg-gray-800/80 text-white rounded-full py-1 px-3"
                        onClick={() => post.likes > 0 && navigate(`/pagcurtidas/${post.id}`)}
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
                        <span className="text-sm text-white hover:underline reaction-count">
                          {post.reaction_type && post.likes > 1 ? (
                            <span>Você e outras {post.likes - 1} pessoas</span>
                          ) : post.reaction_type ? (
                            <span>Você</span>
                          ) : post.likes > 0 ? (
                            <span>{post.likes} pessoas</span>
                          ) : null}
                        </span>
                      </div>
                    )}

                    <button 
                      onClick={() => navigate(`/posts/${post.id}`)}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img src="/comentario.png" alt="Comentários" className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">
                        {post.comment_count || 0}
                      </span>
                    </button>

                    <button
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleWhatsAppShare(post.id)}
                    >
                      <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                    </button>

                    <button
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleShare(post.id)}
                    >
                      <img src="/compartilharlink.png" alt="Compartilhar" className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Posts;
