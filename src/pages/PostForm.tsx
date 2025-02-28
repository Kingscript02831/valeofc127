
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, MapPin } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@/types/locations";
import { toast } from "sonner";

interface UserPost {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  created_at: string;
  location_id?: string;
  location_name?: string;
}

const PostForm = () => {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [userLocationId, setUserLocationId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPosts();
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('location_id')
          .eq('id', user.id)
          .single();
        
        if (profile?.location_id) {
          setUserLocationId(profile.location_id);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar localização do usuário:", error);
    }
  };

  const { data: location_details } = useQuery({
    queryKey: ['location', userLocationId],
    queryFn: async () => {
      if (!userLocationId) return null;
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', userLocationId)
        .single();
      
      if (error) throw error;
      return data as Location;
    },
    enabled: !!userLocationId
  });

  const fetchUserPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserPosts(posts || []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toastHook({
          title: "Erro",
          description: "Você precisa estar logado para criar um post",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const postData = {
        content: newPostContent,
        images: selectedImages,
        video_urls: selectedVideos,
        user_id: user.id,
        location_id: userLocationId,
        location_name: location_details?.name
      };

      if (editingPost) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editingPost);

        if (error) throw error;

        toast.success("Post atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("posts").insert(postData);

        if (error) throw error;

        toast.success("Post criado com sucesso!");
      }

      setNewPostContent("");
      setSelectedImages([]);
      setSelectedVideos([]);
      setEditingPost(null);
      fetchUserPosts();
    } catch (error) {
      console.error("Error with post:", error);
      toastHook({
        title: "Erro",
        description: "Erro ao processar o post",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: UserPost) => {
    setEditingPost(post.id);
    setNewPostContent(post.content);
    setSelectedImages(post.images || []);
    setSelectedVideos(post.video_urls || []);
    if (post.location_id) {
      setUserLocationId(post.location_id);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast.success("Post excluído com sucesso!");
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toastHook({
        title: "Erro",
        description: "Erro ao excluir o post",
        variant: "destructive",
      });
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast.error("Por favor, insira uma URL de imagem válida");
      return;
    }

    if (!newImageUrl.includes('dropbox.com')) {
      toast.error("Por favor, insira uma URL válida do Dropbox");
      return;
    }

    let directImageUrl = newImageUrl;
    if (newImageUrl.includes('www.dropbox.com')) {
      directImageUrl = newImageUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (!selectedImages.includes(directImageUrl)) {
      setSelectedImages([...selectedImages, directImageUrl]);
      setNewImageUrl("");
      toast.success("Imagem adicionada com sucesso!");
    } else {
      toast.error("Esta imagem já foi adicionada");
    }
  };

  const handleAddVideo = () => {
    if (!newVideoUrl) {
      toast.error("Por favor, insira uma URL de vídeo válida");
      return;
    }

    const isDropboxUrl = newVideoUrl.includes('dropbox.com');
    const isYoutubeUrl = newVideoUrl.includes('youtube.com') || newVideoUrl.includes('youtu.be');

    if (!isDropboxUrl && !isYoutubeUrl) {
      toast.error("Por favor, insira uma URL válida do Dropbox ou YouTube");
      return;
    }

    let directVideoUrl = newVideoUrl;
    if (isDropboxUrl && newVideoUrl.includes('www.dropbox.com')) {
      directVideoUrl = newVideoUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (!selectedVideos.includes(directVideoUrl)) {
      setSelectedVideos([...selectedVideos, directVideoUrl]);
      setNewVideoUrl("");
      toast.success("Vídeo adicionado com sucesso!");
    } else {
      toast.error("Este vídeo já foi adicionado");
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 pt-20 pb-24">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                {editingPost ? "Editar post" : "Criar novo post"}
              </h2>
              
              {location_details && (
                <div className="p-4 bg-primary/10 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="text-primary font-medium">Localização do post</Label>
                      <p className="text-sm">{location_details.name} - {location_details.state}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Textarea
                placeholder="O que você está pensando?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="mb-4"
                rows={6}
              />
              {(selectedImages.length > 0 || selectedVideos.length > 0) && (
                <div className="mb-4">
                  <MediaCarousel
                    images={selectedImages}
                    videoUrls={selectedVideos}
                    title="Preview"
                  />
                </div>
              )}
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Imagens do Dropbox</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Cole a URL compartilhada do Dropbox"
                    />
                    <Button type="button" onClick={handleAddImage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  {selectedImages.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                      <Input value={url} readOnly />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div>
                  <Label>Vídeos (Dropbox ou YouTube)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="Cole a URL do Dropbox ou YouTube"
                    />
                    <Button type="button" onClick={handleAddVideo}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  {selectedVideos.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                      <Input value={url} readOnly />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveVideo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && !selectedImages.length && !selectedVideos.length}
              >
                {editingPost ? "Salvar alterações" : "Publicar"}
              </Button>
              {editingPost && (
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => {
                    setEditingPost(null);
                    setNewPostContent("");
                    setSelectedImages([]);
                    setSelectedVideos([]);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Seus posts</h3>
            {userPosts.map((post) => (
              <Card key={post.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                  {post.location_name && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <MapPin size={14} />
                      <span>{post.location_name}</span>
                    </div>
                  )}
                  {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                    <div className="mb-4">
                      <MediaCarousel
                        images={post.images || []}
                        videoUrls={post.video_urls || []}
                        title={post.content}
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PostForm;
