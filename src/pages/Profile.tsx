
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { Dialog, DialogTrigger } from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { 
  LogOut, 
  MapPin, 
  Link2, 
  Eye, 
  ArrowLeft, 
  Pencil, 
  MoreHorizontal,
  Calendar,
  Heart,
  Globe,
  Instagram,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useTheme } from "../components/ThemeProvider";
import ProfileTabs from "../components/ProfileTabs";
import EditProfileDialog from "../components/EditProfileDialog";
import EditPhotosButton from "../components/EditPhotosButton";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import { MediaCarousel } from "../components/MediaCarousel";
import type { Profile } from "../types/profile";
import { format } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Link } from "react-router-dom";
import { ptBR } from "date-fns/locale";

const defaultAvatarImage = "/placeholder.svg";
const defaultCoverImage = "/placeholder.svg";

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
  };
  post_likes: { reaction_type: string; user_id: string; }[];
  post_comments: { id: string; }[];
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { theme } = useTheme();
  const [avatarCount, setAvatarCount] = useState(0);
  const [coverCount, setCoverCount] = useState(0);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isCoverDialogOpen, setIsCoverDialogOpen] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: followStats } = useQuery({
    queryKey: ["followStats", profile?.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      // Buscar contagem de seguidores
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', session.user.id);

      // Buscar contagem de pessoas que o usuário segue
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', session.user.id);

      return {
        followers: followersCount || 0,
        following: followingCount || 0
      };
    },
  });

  const { data: userPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["userPosts", profile?.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:user_id (
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
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar posts:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.id,
  });

  const handlePhotoUpdate = useMutation({
    mutationFn: async ({ type, url }: { type: 'avatar' | 'cover', url: string | null }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      let finalUrl = url;
      if (url && !url.includes('dl=')) {
        finalUrl = url.includes('?') ? `${url}&dl=1` : `${url}?dl=1`;
      }

      const updates = type === 'avatar' 
        ? { avatar_url: finalUrl }
        : { cover_url: finalUrl };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) throw error;

      if (finalUrl) {
        if (type === 'avatar') {
          setAvatarCount(1);
        } else {
          setCoverCount(1);
        }
      } else {
        if (type === 'avatar') {
          setAvatarCount(0);
        } else {
          setCoverCount(0);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Foto atualizada",
        description: "Sua foto foi atualizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar foto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAvatarClick = () => {
    setIsAvatarDialogOpen(true);
  };

  const handleCoverClick = () => {
    setIsCoverDialogOpen(true);
  };

  const handleDeleteAvatar = () => {
    if (window.confirm('Tem certeza que deseja excluir sua foto de perfil?')) {
      handlePhotoUpdate.mutate({ type: 'avatar', url: null });
    }
  };

  const handleDeleteCover = () => {
    if (window.confirm('Tem certeza que deseja excluir sua foto de capa?')) {
      handlePhotoUpdate.mutate({ type: 'cover', url: null });
    }
  };

  const { data: userProducts } = useQuery({
    queryKey: ["userProducts"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", session.user.id);

      return data || [];
    },
  });

  const copyProfileLink = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(`${window.location.origin}/perfil/${profile.username}`);
      toast({
        title: "Link copiado!",
        description: "O link do seu perfil foi copiado para a área de transferência.",
      });
    }
  };

  const handleSubmit = async (values: Partial<Profile>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o perfil",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatRelationshipStatus = (status: string | null | undefined) => {
    if (!status) return null;
    const statusMap: Record<string, string> = {
      single: "Solteiro(a)",
      dating: "Namorando",
      widowed: "Viúvo(a)"
    };
    return statusMap[status] || status;
  };

  const formatBirthDate = (date: string | null | undefined) => {
    if (!date) return null;
    return format(new Date(date), "dd/MM/yyyy");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const renderContent = (content: string) => {
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return <span key={index} className="text-blue-500">{word} </span>;
      } else if (word.startsWith('@')) {
        return <span key={index} className="text-blue-500">{word} </span>;
      }
      return word + ' ';
    });
  };

  useEffect(() => {
    if (profile) {
      setAvatarCount(profile.avatar_url ? 1 : 0);
      setCoverCount(profile.cover_url ? 1 : 0);
    }
  }, [profile]);

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{profile?.full_name}</h1>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center">
          <LogOut className="h-6 w-6" />
        </button>
      </div>

      <div className="pt-16 pb-20">
        <div className="relative">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
            {profile?.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Capa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultCoverImage;
                }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                <p className="text-gray-500">Sem Capa de Perfil</p>
              </div>
            )}
          </div>

          <div className="relative -mt-16 px-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-black">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatarImage;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                    <p className="text-gray-500">Sem foto de perfil</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                  <p className="text-gray-400">@{profile?.username}</p>
                  {profile?.status && (
                    <p className="text-yellow-500 text-sm mt-1">
                      {profile.status}
                    </p>
                  )}
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="font-semibold">{followStats?.followers || 0}</p>
                    <p className="text-sm text-gray-500">Seguidores</p>
                  </div>
                  <div>
                    <p className="font-semibold">{followStats?.following || 0}</p>
                    <p className="text-sm text-gray-500">Seguindo</p>
                  </div>
                </div>
              </div>

              {profile?.city && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Mora em {profile.city}
                </p>
              )}

              <div className="space-y-2 mt-3">
                {profile?.relationship_status && (
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {formatRelationshipStatus(profile.relationship_status)}
                  </p>
                )}
                
                {profile?.birth_date && (
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatBirthDate(profile.birth_date)}
                  </p>
                )}
                
                <div className="flex flex-col gap-2 mt-2">
                  {profile?.instagram_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 w-fit"
                      onClick={() => window.open(profile.instagram_url, '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                  )}
                  
                  {profile?.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 w-fit"
                      onClick={() => window.open(profile.website, '_blank')}
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </Button>
                  )}
                </div>
              </div>

              {!isPreviewMode ? (
                <div className="flex justify-end gap-2 mt-4">
                  <EditPhotosButton 
                    onAvatarClick={handleAvatarClick}
                    onCoverClick={handleCoverClick}
                    onDeleteAvatar={handleDeleteAvatar}
                    onDeleteCover={handleDeleteCover}
                    avatarCount={avatarCount}
                    coverCount={coverCount}
                  />

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className={`${theme === 'light' ? 'text-black border-gray-300' : 'text-white border-gray-700'}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar perfil
                      </Button>
                    </DialogTrigger>
                    <EditProfileDialog profile={profile} onSubmit={handleSubmit} />
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-gray-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-800">
                      <DropdownMenuItem onClick={copyProfileLink} className="text-white cursor-pointer">
                        <Link2 className="h-4 w-4 mr-2" />
                        Copiar link do perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsPreviewMode(true)} className="text-white cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver como
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsPreviewMode(false)} 
                  variant="outline" 
                  className={`${theme === 'light' ? 'text-black border-gray-300' : 'text-white border-gray-700'}`}
                >
                  Sair do modo preview
                </Button>
              )}
            </div>

            <div className="mt-6">
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
                  {isPostsLoading ? (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-gray-500">Carregando posts...</p>
                    </div>
                  ) : userPosts && userPosts.length > 0 ? (
                    <div className="space-y-4 p-4">
                      {userPosts.map((post: Post) => (
                        <Link to={`/posts/${post.id}`} key={post.id}>
                          <Card className={`${theme === 'light' ? 'bg-white' : 'bg-black'} overflow-hidden`}>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarImage src={post.user?.avatar_url} />
                                    <AvatarFallback>
                                      {post.user?.full_name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">{post.user?.full_name}</p>
                                    <p className="text-sm text-gray-500">
                                      {formatDate(post.created_at)}
                                    </p>
                                  </div>
                                </div>

                                {post.content && (
                                  <p className="text-sm">
                                    {renderContent(post.content)}
                                  </p>
                                )}

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

                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{post.post_likes?.length || 0}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{post.post_comments?.length || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
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
            </div>
          </div>
        </div>
      </div>

      <PhotoUrlDialog
        isOpen={isAvatarDialogOpen}
        onClose={() => setIsAvatarDialogOpen(false)}
        onConfirm={(url) => handlePhotoUpdate.mutate({ type: 'avatar', url })}
        title="Alterar foto de perfil"
      />

      <PhotoUrlDialog
        isOpen={isCoverDialogOpen}
        onClose={() => setIsCoverDialogOpen(false)}
        onConfirm={(url) => handlePhotoUpdate.mutate({ type: 'cover', url })}
        title="Alterar foto de capa"
      />

      <BottomNav />
    </div>
  );
}
