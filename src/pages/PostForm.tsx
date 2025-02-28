
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeProvider";
import { useUserLocation } from "../components/locpost";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const PostForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { userLocation } = useUserLocation();
  
  // Busca o usuário atual
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return null;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
      
      // Cria URLs de visualização para as novas imagens
      const newImageUrls = newImages.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newImageUrls]);
    }
  };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newVideos = Array.from(e.target.files);
      setVideos((prev) => [...prev, ...newVideos]);
      
      // Cria URLs de visualização para os novos vídeos
      const newVideoUrls = newVideos.map((file) => URL.createObjectURL(file));
      setVideoUrls((prev) => [...prev, ...newVideoUrls]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => {
      // Libera a URL do objeto
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };
  
  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoUrls((prev) => {
      // Libera a URL do objeto
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPostMedia = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar uma publicação",
        variant: "destructive",
      });
      return { imageURLs: [], videoURLs: [] };
    }
    
    const imageURLs: string[] = [];
    const videoURLs: string[] = [];
    
    // Upload de imagens
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, image);
        
      if (uploadError) {
        toast({
          title: "Erro",
          description: `Erro ao fazer upload da imagem: ${uploadError.message}`,
          variant: "destructive",
        });
      } else {
        const { data } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);
          
        imageURLs.push(data.publicUrl);
      }
    }
    
    // Upload de vídeos
    for (const video of videos) {
      const fileExt = video.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("post-videos")
        .upload(filePath, video);
        
      if (uploadError) {
        toast({
          title: "Erro",
          description: `Erro ao fazer upload do vídeo: ${uploadError.message}`,
          variant: "destructive",
        });
      } else {
        const { data } = supabase.storage
          .from("post-videos")
          .getPublicUrl(filePath);
          
        videoURLs.push(data.publicUrl);
      }
    }
    
    return { imageURLs, videoURLs };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione conteúdo, imagens ou vídeos à sua publicação",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar uma publicação",
          variant: "destructive",
        });
        return;
      }
      
      // Upload de mídia
      const { imageURLs, videoURLs } = await uploadPostMedia();
      
      // Prepare location data
      const locationData = profile?.location || null;
      const city = profile?.city || null;
      
      // Criar post com informações de localização
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: session.user.id,
          content,
          images: imageURLs,
          video_urls: videoURLs,
          location: locationData,
          city: city
        });
        
      if (error) {
        throw error;
      }
      
      // Limpar o formulário
      setContent("");
      setImages([]);
      setVideos([]);
      setImageUrls([]);
      setVideoUrls([]);
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      toast({
        title: "Sucesso",
        description: "Publicação criada com sucesso",
      });
      
      // Redirecionar para a página de posts
      navigate("/posts");
    } catch (error) {
      console.error("Erro ao criar publicação:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar sua publicação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
      <Navbar />
      <div className="container mx-auto pt-20 pb-24 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
            Criar Publicação
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                className={`w-full p-3 rounded-lg ${
                  theme === 'light' 
                    ? 'bg-gray-100 text-gray-800 border-gray-200' 
                    : 'bg-gray-800 text-gray-100 border-gray-700'
                } border`}
                placeholder="O que está acontecendo?"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Visualização de imagens */}
            {imageUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Preview ${index}`} 
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Visualização de vídeos */}
            {videoUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {videoUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <video 
                      src={url} 
                      className="w-full h-32 object-cover rounded" 
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2 mb-6">
              <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border ${
                theme === 'light' 
                  ? 'border-gray-200 bg-gray-50 text-gray-700' 
                  : 'border-gray-700 bg-gray-800 text-gray-200'
              } cursor-pointer hover:bg-opacity-80 transition-all`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
                <span>Adicionar Imagens</span>
              </label>

              <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border ${
                theme === 'light' 
                  ? 'border-gray-200 bg-gray-50 text-gray-700' 
                  : 'border-gray-700 bg-gray-800 text-gray-200'
              } cursor-pointer hover:bg-opacity-80 transition-all`}>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleVideoChange}
                  disabled={uploading}
                />
                <span>Adicionar Vídeos</span>
              </label>
            </div>

            {userLocation?.city && (
              <div className={`mb-4 p-2 rounded-lg ${
                theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-blue-900 text-blue-200'
              }`}>
                <p className="text-sm">
                  Sua publicação será associada à sua localização: {userLocation.city}
                </p>
              </div>
            )}

            <Button 
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              disabled={uploading}
            >
              {uploading ? "Publicando..." : "Publicar"}
            </Button>
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PostForm;
