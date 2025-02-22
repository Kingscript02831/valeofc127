import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MediaCarousel } from "../components/MediaCarousel";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "../components/Navbar";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import ReactionMenu from "../components/ReactionMenu";
import BottomNav from "../components/BottomNav";

interface Post {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  created_at: string;
  likes: number;
  reaction_type?: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

const getReactionIcon = (type: string) => {
  switch (type) {
    case 'love':
      return '❤️';
    case 'haha':
      return '😂';
    case 'sad':
      return '😞';
    case 'angry':
      return '🤬';
    default:
      return null;
  }
};

export default function Posts() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = data.map(post => ({
        ...post,
        reaction_type: post.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
        likes: post.post_likes?.length || 0
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar os posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleReaction = async (postId: string, type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para reagir",
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
        if (existingReaction.reaction_type === type) {
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('post_likes')
            .update({ reaction_type: type })
            .eq('post_id', postId)
            .eq('user_id', user.id);
        }
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: type
          });
      }

      setActiveReactionMenu(null);
      await fetchPosts();
      
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (url: string) => {
    try {
      await navigator.share({
        url: url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para sua área de transferência",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
        return `${minutes} minutos atrás`;
      }
      return `${Math.floor(diffInHours)} horas atrás`;
    } else if (diffInHours < 48) {
      return `Ontem às ${format(date, 'HH:mm')}`;
    } else {
      return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-0">
                    <div className="animate-pulse">
                      <div className="flex items-center gap-3 p-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                        </div>
                      </div>
                      <div className="h-64 bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            posts.map((post: Post, index) => (
              <div key={post.id}>
                <Card className="border-none shadow-sm bg-card hover:bg-accent/5 transition-colors duration-200">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
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

                    {post.content && (
                      <p className="px-4 pb-4 whitespace-pre-wrap">{post.content}</p>
                    )}

                    {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                      <MediaCarousel
                        images={post.images || []}
                        videoUrls={post.video_urls || []}
                        title={post.content || ""}
                      />
                    )}

                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <button
                          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            // Se já tem uma reação, remove ela
                            if (post.reaction_type) {
                              handleReaction(post.id, post.reaction_type);
                            } else {
                              // Se não tem reação, abre o menu
                              setActiveReactionMenu(activeReactionMenu === post.id ? null : post.id);
                            }
                          }}
                        >
                          {post.reaction_type ? (
                            <span className="text-xl text-blue-500">
                              {getReactionIcon(post.reaction_type) || <ThumbsUp className="w-5 h-5" />}
                            </span>
                          ) : (
                            <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${post.reaction_type ? 'text-blue-500' : 'text-muted-foreground'}`}>
                            {post.likes || 0}
                          </span>
                        </button>
                        
                        <ReactionMenu 
                          isOpen={activeReactionMenu === post.id}
                          onSelect={(type) => handleReaction(post.id, type)}
                        />

                        <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          <MessageCircle className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">0</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleShare(`${window.location.origin}/post/${post.id}`)}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Share2 className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
                {index < posts.length - 1 && (
                  <Separator className="my-4 opacity-40" />
                )}
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
