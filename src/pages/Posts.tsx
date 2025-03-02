import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Heart, MessageCircle, Share2, MoreHorizontal, Image, Video, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "../components/ui/separator";
import { Card, CardContent } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import MediaCarousel from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import StoriesBar from "../components/StoriesBar";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  liked_by_current_user?: boolean;
  comments_count?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

const Posts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);

  // Busca o usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      return data ? { ...data, id: user.id } : null;
    },
  });

  // Busca posts
  const { data: posts, isLoading: isLoadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      // Busca posts com informações do perfil
      const { data: posts, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        return [];
      }

      // Se o usuário estiver logado, verifica quais posts ele curtiu
      if (currentUser?.id) {
        const { data: likedPosts, error: likedError } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", currentUser.id);

        if (!likedError && likedPosts) {
          const likedPostIds = new Set(likedPosts.map(like => like.post_id));
          
          // Para cada post, busca o número de comentários
          return await Promise.all(posts.map(async (post) => {
            const { count, error: countError } = await supabase
              .from("post_comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id);
              
            return {
              ...post,
              liked_by_current_user: likedPostIds.has(post.id),
              comments_count: countError ? 0 : count
            };
          }));
        }
      }

      // Se o usuário não estiver logado ou houver erro, retorna os posts sem informação de curtida
      return await Promise.all(posts.map(async (post) => {
        const { count, error: countError } = await supabase
          .from("post_comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);
          
        return {
          ...post,
          liked_by_current_user: false,
          comments_count: countError ? 0 : count
        };
      }));
    },
    enabled: true,
  });

  // Busca comentários do post atual
  const { data: comments, isLoading: isLoadingComments, refetch: refetchComments } = useQuery({
    queryKey: ["comments", currentPostId],
    queryFn: async () => {
      if (!currentPostId) return [];

      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("post_id", currentPostId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return [];
      }

      return data;
    },
    enabled: !!currentPostId,
  });

  // Mutação para criar um novo post
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        toast.error("Você precisa estar logado para publicar");
        return;
      }

      setIsSubmitting(true);

      try {
        // Upload de imagens
        const imageUrls = await Promise.all(
          selectedImages.map(async (file) => {
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
              .from("post-images")
              .upload(fileName, file);

            if (error) throw error;

            return supabase.storage.from("post-images").getPublicUrl(fileName).data.publicUrl;
          })
        );

        // Upload de vídeos
        const videoUrls = await Promise.all(
          selectedVideos.map(async (file) => {
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
              .from("post-videos")
              .upload(fileName, file);

            if (error) throw error;

            return supabase.storage.from("post-videos").getPublicUrl(fileName).data.publicUrl;
          })
        );

        // Cria o post
        const { data, error } = await supabase
          .from("posts")
          .insert({
            user_id: currentUser.id,
            content: newPostContent,
            images: imageUrls,
            video_urls: videoUrls,
          })
          .select();

        if (error) throw error;

        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success("Post publicado com sucesso!");
      setNewPostContent("");
      setSelectedImages([]);
      setSelectedVideos([]);
      setMediaPreviewUrls([]);
      setIsPostDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast.error("Erro ao publicar o post");
    },
  });

  // Mutação para curtir/descurtir um post
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!currentUser) {
        toast.error("Você precisa estar logado para curtir");
        return;
      }

      if (isLiked) {
        // Remove a curtida
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("post_id", postId);

        if (error) throw error;
      } else {
        // Adiciona a curtida
        const { error } = await supabase
          .from("post_likes")
          .insert({
            user_id: currentUser.id,
            post_id: postId,
          });

        if (error) throw error;
      }

      // Atualiza o contador de curtidas
      const { data, error } = await supabase
        .from("posts")
        .select("likes")
        .eq("id", postId)
        .single();

      if (error) throw error;

      const newLikes = isLiked ? data.likes - 1 : data.likes + 1;

      const { error: updateError } = await supabase
        .from("posts")
        .update({ likes: newLikes })
        .eq("id", postId);

      if (updateError) throw updateError;

      return { postId, isLiked: !isLiked, likes: newLikes };
    },
    onSuccess: (data) => {
      if (!data) return;
      
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((post: Post) => {
          if (post.id === data.postId) {
            return {
              ...post,
              liked_by_current_user: data.isLiked,
              likes: data.likes,
            };
          }
          return post;
        });
      });
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      toast.error("Erro ao curtir o post");
    },
  });

  // Mutação para adicionar um comentário
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !currentPostId) {
        toast.error("Você precisa estar logado para comentar");
        return;
      }

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          user_id: currentUser.id,
          post_id: currentPostId,
          content: newComment,
        })
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `);

      if (error) throw error;

      return data[0];
    },
    onSuccess: (newComment) => {
      if (!newComment) return;
      
      setNewComment("");
      refetchComments();
      
      // Atualiza o contador de comentários no post
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((post: Post) => {
          if (post.id === currentPostId) {
            return {
              ...post,
              comments_count: (post.comments_count || 0) + 1,
            };
          }
          return post;
        });
      });
      
      toast.success("Comentário adicionado!");
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast.error("Erro ao adicionar comentário");
    },
  });

  // Manipuladores de eventos
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
      
      if (selectedImages.length + imageFiles.length > 10) {
        toast.error("Você pode selecionar no máximo 10 imagens");
        return;
      }
      
      setSelectedImages(prev => [...prev, ...imageFiles]);
      
      // Cria URLs para preview
      const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
      setMediaPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const videoFiles = filesArray.filter(file => file.type.startsWith('video/'));
      
      if (selectedVideos.length + videoFiles.length > 2) {
        toast.error("Você pode selecionar no máximo 2 vídeos");
        return;
      }
      
      setSelectedVideos(prev => [...prev, ...videoFiles]);
      
      // Cria URLs para preview
      const newPreviewUrls = videoFiles.map(file => URL.createObjectURL(file));
      setMediaPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    // Revoga a URL do objeto para liberar memória
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    
    // Remove o item do array de previews
    const newPreviewUrls = [...mediaPreviewUrls];
    newPreviewUrls.splice(index, 1);
    setMediaPreviewUrls(newPreviewUrls);
    
    // Determina se é uma imagem ou vídeo e remove do array correspondente
    const totalImages = selectedImages.length;
    if (index < totalImages) {
      const newImages = [...selectedImages];
      newImages.splice(index, 1);
      setSelectedImages(newImages);
    } else {
      const videoIndex = index - totalImages;
      const newVideos = [...selectedVideos];
      newVideos.splice(videoIndex, 1);
      setSelectedVideos(newVideos);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && selectedImages.length === 0 && selectedVideos.length === 0) {
      toast.error("Adicione um texto ou mídia para publicar");
      return;
    }
    
    createPostMutation.mutate();
  };

  const handleToggleLike = (postId: string, isLiked: boolean) => {
    if (!currentUser) {
      toast.error("Faça login para curtir posts");
      return;
    }
    
    toggleLikeMutation.mutate({ postId, isLiked });
  };

  const handleOpenComments = (postId: string) => {
    setCurrentPostId(postId);
    setIsCommentsDialogOpen(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Digite um comentário");
      return;
    }
    
    addCommentMutation.mutate();
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: `Post de ${post.profiles.username}`,
        text: post.content,
        url: `${window.location.origin}/posts/${post.id}`,
      }).catch(err => {
        console.error('Error sharing:', err);
        toast.error("Erro ao compartilhar");
      });
    } else {
      // Fallback para navegadores que não suportam a API Web Share
      navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
        .then(() => toast.success("Link copiado para a área de transferência"))
        .catch(() => toast.error("Erro ao copiar link"));
    }
  };

  // Limpa as URLs de preview quando o componente é desmontado
  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      {/* Add the StoriesBar component here */}
      <div className="mt-2 mb-2 bg-card/50">
        <StoriesBar />
      </div>
      <main className="container mx-auto max-w-xl flex-1 p-4">
        {/* Área de criação de post */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {currentUser?.avatar_url ? (
                  <AvatarImage src={currentUser.avatar_url} alt={currentUser.username || ""} />
                ) : (
                  <AvatarFallback>
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div 
                className="flex-1 bg-muted/50 rounded-full px-4 py-2 cursor-pointer"
                onClick={() => setIsPostDialogOpen(true)}
              >
                <span className="text-muted-foreground">O que está acontecendo?</span>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full text-primary"
                onClick={() => setIsPostDialogOpen(true)}
              >
                <Image className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de posts */}
        {isLoadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                      <div className="h-3 w-16 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                  <div className="h-40 bg-muted rounded-md mt-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhum post encontrado.</p>
            <Button onClick={() => setIsPostDialogOpen(true)}>
              Criar o primeiro post
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts?.map((post: Post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Cabeçalho do post */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          className="h-10 w-10 cursor-pointer"
                          onClick={() => navigate(`/perfil/${post.profiles.username}`)}
                        >
                          {post.profiles.avatar_url ? (
                            <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.username} />
                          ) : (
                            <AvatarFallback>
                              {post.profiles.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => navigate(`/perfil/${post.profiles.username}`)}
                          >
                            {post.profiles.username}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/posts/${post.id}`)}>
                            Ver detalhes
                          </DropdownMenuItem>
                          {currentUser?.id === post.user_id && (
                            <DropdownMenuItem className="text-destructive">
                              Excluir post
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleShare(post)}>
                            Compartilhar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Conteúdo do post */}
                  {post.content && (
                    <div className="px-4 pb-3">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                    </div>
                  )}

                  {/* Mídia do post */}
                  {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                    <div className="mb-2">
                      <MediaCarousel 
                        images={post.images || []} 
                        videoUrls={post.video_urls || []}
                        title={post.content || "Post"}
                      />
                    </div>
                  )}

                  {/* Ações do post */}
                  <div className="px-4 py-2 flex items-center justify-between border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`gap-2 ${post.liked_by_current_user ? 'text-red-500' : ''}`}
                      onClick={() => handleToggleLike(post.id, !!post.liked_by_current_user)}
                    >
                      <Heart className={`h-5 w-5 ${post.liked_by_current_user ? 'fill-current' : ''}`} />
                      <span>{post.likes || 0}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-2"
                      onClick={() => handleOpenComments(post.id)}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments_count || 0}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleShare(post)}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
      <PWAInstallPrompt />

      {/* Dialog para criar post */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar nova publicação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="O que está acontecendo?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            
            {mediaPreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaPreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    {url.includes('video') ? (
                      <video 
                        src={url} 
                        className="h-32 w-full object-cover rounded-md"
                        controls
                      />
                    ) : (
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="h-32 w-full object-cover rounded-md"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveMedia(index)}
                    >
                      <span className="sr-only">Remover</span>
                      <span aria-hidden="true">×</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={selectedImages.length >= 10}
              >
                <Image className="h-4 w-4" />
                <span>Imagem</span>
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => document.getElementById('video-upload')?.click()}
                disabled={selectedVideos.length >= 2}
              >
                <Video className="h-4 w-4" />
                <span>Vídeo</span>
              </Button>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideoSelect}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreatePost}
              disabled={isSubmitting || (!newPostContent.trim() && selectedImages.length === 0 && selectedVideos.length === 0)}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para comentários */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comentários</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {isLoadingComments ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                      <div className="h-3 w-full bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments?.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              comments?.map((comment: Comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    {comment.profiles.avatar_url ? (
                      <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles.username} />
                    ) : (
                      <AvatarFallback>
                        {comment.profiles.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{comment.profiles.username}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "d MMM • HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-8 w-8">
              {currentUser?.avatar_url ? (
                <AvatarImage src={currentUser.avatar_url} alt={currentUser.username || ""} />
              ) : (
                <AvatarFallback>
                  {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <Input
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button 
              size="icon" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Posts;
