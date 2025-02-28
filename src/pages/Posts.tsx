
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactionMenu from "@/components/ReactionMenu";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getReactionIcon } from "@/utils/emojisPosts";
import Tags from "@/components/Tags";

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

const Posts: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);

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
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="h-10 w-10 border-2 border-primary/10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/perfil/${post.user.username}`)}
                      >
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
                          <img src="/icone de curtida.png" alt="Curtir" className="w-5 h-5" />
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
                      <img src="/compartilhar.png" alt="Compartilhar" className="w-5 h-5" />
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
