import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { Bell, Search, Share2, MessageCircle, MessageSquareMore, ThumbsUp, UserPlus2, Check } from "lucide-react";
import { MediaCarousel } from "../components/MediaCarousel";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactionMenu from "../components/ReactionMenu";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getReactionIcon } from "../utils/emojisPosts";

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
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    followers_count?: number;
    is_following?: boolean;
  };
}

const Posts: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"following" | "forYou">("forYou");

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: following } = useQuery({
    queryKey: ['following', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      return data?.map(f => f.following_id) || [];
    },
    enabled: !!currentUser,
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', searchTerm, activeTab, following],
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

        if (searchTerm) {
          query = query.ilike('content', `%${searchTerm}%`);
        }

        if (activeTab === "following" && following?.length >= 0) {
          query = query.in('user_id', following.length ? following : [null]);
        }

        const { data: postsData, error } = await query;
        if (error) throw error;

        const enhancedPosts = await Promise.all(postsData.map(async (post) => {
          const { count: followersCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', post.user.id);

          const { data: isFollowing } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', currentUser?.id)
            .eq('following_id', post.user.id)
            .maybeSingle();

          return {
            ...post,
            reaction_type: post.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
            likes: post.post_likes?.length || 0,
            comment_count: post.post_comments?.length || 0,
            user: {
              ...post.user,
              followers_count: followersCount,
              is_following: !!isFollowing
            }
          };
        }));

        return enhancedPosts;
      } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
    },
  });

  const handleFollow = async (userToFollow: Post['user']) => {
    if (!currentUser) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para seguir outros usuários",
      });
      return;
    }

    try {
      const isFollowing = userToFollow.is_following;

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userToFollow.id);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userToFollow.id
          });

        await supabase
          .from('notifications')
          .insert({
            user_id: userToFollow.id,
            title: 'Novo seguidor',
            message: `${currentUser.user_metadata.full_name || 'Alguém'} começou a te seguir`,
            type: 'system',
            reference_id: currentUser.id
          });
      }

      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.invalidateQueries({ queryKey: ['following'] });

      toast({
        title: isFollowing ? "Deixou de seguir" : "Seguindo",
        description: isFollowing 
          ? `Você deixou de seguir ${userToFollow.username}`
          : `Você está seguindo ${userToFollow.username}`,
      });
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a ação",
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
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (post: Post) => {
    try {
      const shareData = {
        title: 'Vale OFC',
        text: `Post de ${post.user.username}: ${post.content}`,
        url: `${window.location.origin}/posts/${post.id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copiado!",
          description: "O link do post foi copiado para sua área de transferência",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm pb-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:scale-105 transition-transform text-foreground"
              onClick={() => navigate('/notify')}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 rounded-full bg-card/50 backdrop-blur-sm border-none shadow-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant={activeTab === "following" ? "default" : "ghost"}
              onClick={() => {
                if (!currentUser) {
                  toast({
                    title: "Faça login",
                    description: "Você precisa estar logado para ver posts de quem você segue",
                  });
                  return;
                }
                setActiveTab("following");
              }}
              className="flex-1 max-w-[200px]"
            >
              Seguindo
            </Button>
            <Button
              variant={activeTab === "forYou" ? "default" : "ghost"}
              onClick={() => setActiveTab("forYou")}
              className="flex-1 max-w-[200px]"
            >
              Para Você
            </Button>
          </div>
        </div>

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
          ) : posts?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {activeTab === "following" 
                  ? "Nenhum post de pessoas que você segue." 
                  : "Nenhum post encontrado."}
              </p>
            </div>
          ) : (
            posts?.map((post: Post) => (
              <Card key={post.id} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="cursor-pointer"
                      onClick={() => navigate(`/user/${post.user_id}`)}
                    >
                      <AvatarImage src={post.user.avatar_url || ''} />
                      <AvatarFallback>
                        {post.user.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/user/${post.user_id}`)}
                        >
                          {post.user.username || 'Usuário'}
                        </h3>
                        {currentUser?.id !== post.user_id && (
                          <Button
                            variant={post.user.is_following ? "secondary" : "default"}
                            size="sm"
                            className="ml-2"
                            onClick={() => handleFollow(post.user)}
                          >
                            {post.user.is_following ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <UserPlus2 className="h-4 w-4 mr-1" />
                            )}
                            {post.user.is_following ? 'Seguindo' : 'Seguir'}
                          </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {post.user.followers_count} seguidores
                        </span>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </time>
                    </div>
                  </div>

                  <p className="mt-3 text-sm">{post.content}</p>

                  {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                    <div className="mt-3">
                      <MediaCarousel images={post.images} videos={post.video_urls} />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id)}
                      >
                        {post.reaction_type ? (
                          <span className="text-lg">{getReactionIcon(post.reaction_type)}</span>
                        ) : (
                          <ThumbsUp className="h-4 w-4" />
                        )}
                        <span>{post.likes || 0}</span>
                      </Button>
                      {activeReactionMenu === post.id && (
                        <ReactionMenu
                          postId={post.id}
                          onClose={() => setActiveReactionMenu(null)}
                        />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comment_count || 0}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
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
