
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "./ThemeProvider";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MediaCarousel } from "./MediaCarousel";
import Tags from "./Tags";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductWithDistance {
  id: string;
  title: string;
  price: number;
  images?: string[];
  distance?: number;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
    id: string;
  };
  post_likes: { reaction_type: string; user_id: string; }[];
  post_comments: { id: string; }[];
}

interface ProfileTabsProps {
  userProducts: ProductWithDistance[] | undefined;
  userPosts: Post[] | undefined;
  isLoading?: boolean;
  profileUserId?: string;
  isOwnProfile?: boolean;
}

const ProfileTabs = ({ userProducts, userPosts, isLoading, profileUserId, isOwnProfile = false }: ProfileTabsProps) => {
  const { theme } = useTheme();
  const { toast: hookToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Get current user and check follow status
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);

        if (profileUserId && profileUserId !== session.user.id) {
          // Check if current user is following the profile user
          const { data, error } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', session.user.id)
            .eq('following_id', profileUserId)
            .single();
          
          if (!error && data) {
            setIsFollowing(true);
          }
        }
      }
    };
    fetchCurrentUser();
  }, [profileUserId]);

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId || !profileUserId) {
        throw new Error("Missing user information");
      }
      
      const { data, error } = await supabase
        .from('follows')
        .insert([
          { follower_id: currentUserId, following_id: profileUserId }
        ]);
        
      if (error) throw error;
      
      // Add notification to the other user about being followed
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: profileUserId,
            title: 'Novo seguidor',
            message: 'começou a seguir você.',
            type: 'system',
            reference_id: currentUserId
          }
        ]);
        
      return data;
    },
    onSuccess: () => {
      setIsFollowing(true);
      toast.success("Seguindo com sucesso!", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
      queryClient.invalidateQueries({ queryKey: ["followStats"] });
    },
    onError: (error) => {
      console.error("Error following user:", error);
      toast.error("Erro ao seguir usuário", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    }
  });

  // Unfollow user mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId || !profileUserId) {
        throw new Error("Missing user information");
      }
      
      const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', profileUserId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsFollowing(false);
      toast.success("Deixou de seguir com sucesso!", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
      queryClient.invalidateQueries({ queryKey: ["followStats"] });
    },
    onError: (error) => {
      console.error("Error unfollowing user:", error);
      toast.error("Erro ao deixar de seguir usuário", {
        position: "top-center",
        style: { marginTop: "64px" }
      });
    }
  });

  const handleFollowAction = () => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
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

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({
        url: `${window.location.origin}/posts/${postId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
      hookToast({
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

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent">
        <TabsTrigger
          value="posts"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Produtos
        </TabsTrigger>
        <TabsTrigger
          value="reels"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Reels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="min-h-[200px]">
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
        ) : userPosts && userPosts.length > 0 ? (
          <div className="space-y-4 p-4">
            {/* Show follow button at the top if not own profile */}
            {!isOwnProfile && profileUserId && profileUserId !== currentUserId && (
              <div className="flex justify-end mb-4">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className={`h-8 rounded-full border-2 ${
                    isFollowing 
                      ? 'bg-transparent border-white text-white hover:bg-background/10' 
                      : 'bg-primary text-white'
                  }`}
                  onClick={handleFollowAction}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      Seguir
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {userPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden bg-white dark:bg-card border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="h-10 w-10 border-2 border-primary/10 cursor-pointer hover:opacity-80 transition-opacity"
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
                    <Link
                      to={`/posts/${post.id}`}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img src="/curtidas.png" alt="Curtir" className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">
                        {post.post_likes?.length || 0}
                      </span>
                    </Link>

                    <Link
                      to={`/posts/${post.id}`}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img src="/comentario.png" alt="Comentários" className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">
                        {post.post_comments?.length || 0}
                      </span>
                    </Link>

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
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Ainda não há Posts</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="products" className="min-h-[200px]">
        {userProducts && userProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {userProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <Card className={`${theme === 'light' ? 'bg-white' : 'bg-black'} shadow-none border-0 transition-all duration-300 hover:scale-105`}>
                  <CardContent className="p-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className={`font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>{product.title}</h3>
                    <p className="text-green-500">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(product.price))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Ainda não há Produtos</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reels" className="min-h-[200px]">
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-gray-500">Ainda não há Reels</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
