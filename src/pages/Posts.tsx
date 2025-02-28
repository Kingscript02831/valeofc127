
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MediaCarousel } from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import ReactionMenu from "@/components/ReactionMenu";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getReactionIcon } from "@/utils/emojisPosts";
import Tags from "@/components/Tags";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, MoreVertical } from "lucide-react";
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

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch user's following status
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
            )
          `)
          .order('created_at', { ascending: false });

        const { data: postsData, error } = await query;
        if (error) throw error;

        const postsWithCounts = postsData?.map(post => ({
          ...post,
          reaction_type: post.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
          likes: post.post_likes?.length || 0,
          comment_count: post.post_comments?.length || 0
        }));

        return postsWithCounts;
      } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
    },
  });

  // Follow user mutation
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

      // Insert a notification about the follow
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

  // Unfollow mutation
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
      return; // Não pode seguir a si mesmo
    }

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
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-xl mx-auto space-y-4">
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
                          <p className="text-sm text-muted-foreground font-medium uppercase">
                            GRÃO Mogol-MG
                          </p>
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

                  <div className="flex items-center justify-between p-2 mt-2 border-t border-border/40">
                    <div className="relative">
                      <button
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                      >
                        {post.reaction_type ? (
                          <span className="text-blue-500">
                            {getReactionIcon(post.reaction_type)}
                          </span>
                        ) : (
                          <img src="/curtidas.png" alt="Curtir" className="w-5 h-5" />
                        )}
                        <span className={`text-sm ${post.reaction_type ? 'text-blue-500' : 'text-muted-foreground'}`}>
                          {post.likes || 0}
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
                      onClick={() => navigate(`/posts/${post.id}`)}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img src="/comentario.png" alt="Comentários" className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">
                        {post.comment_count || 0}
                      </span>
                    </button>

                    <button
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
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
      </main>
      <BottomNav />
    </div>
  );
};

export default Posts;
