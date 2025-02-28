
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useTheme } from "../components/ThemeProvider";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { Tag, X, Upload, Image as ImageIcon, Camera } from "lucide-react";
import { useUserLocation } from "../components/locpost";

export default function PostForm() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userLocation, userCity, loading: locationLoading } = useUserLocation();
  
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Nova Publicação";
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalFiles = selectedFiles.length + images.length + videos.length;
      
      if (totalFiles > 10) {
        toast.error("Você pode adicionar no máximo 10 arquivos");
        return;
      }

      const newImages: File[] = [];
      const newVideos: File[] = [];
      
      selectedFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          newImages.push(file);
        } else if (file.type.startsWith('video/')) {
          newVideos.push(file);
        }
      });

      setImages([...images, ...newImages]);
      setVideos([...videos, ...newVideos]);

      // Generate previews
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const handleTagAdd = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim().toLowerCase();
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput("");
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Upload images if any
      const imageUrls: string[] = [];
      const videoUrls: string[] = [];
      
      // Upload images first
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `posts/${user.id}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, image);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
          
        imageUrls.push(publicUrl);
      }
      
      // Upload videos next
      for (const video of videos) {
        const fileExt = video.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `videos/${user.id}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, video);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
          
        videoUrls.push(publicUrl);
      }
      
      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content,
          user_id: user.id,
          images: imageUrls.length > 0 ? imageUrls : null,
          videos: videoUrls.length > 0 ? videoUrls : null,
          tags: tags.length > 0 ? tags : null,
          city: userCity,
          location: userLocation
        })
        .select()
        .single();
        
      if (postError) {
        throw postError;
      }
      
      return post;
    },
    onSuccess: () => {
      toast.success("Publicação criada com sucesso!");
      navigate('/posts');
    },
    onError: (error) => {
      console.error("Erro ao criar publicação:", error);
      setError("Erro ao criar publicação. Por favor, tente novamente.");
      toast.error("Erro ao criar publicação. Por favor, tente novamente.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("O conteúdo da publicação não pode estar vazio");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Create form data for upload
    const formData = new FormData();
    formData.append("content", content);
    
    images.forEach(image => {
      formData.append("images", image);
    });
    
    videos.forEach(video => {
      formData.append("videos", video);
    });
    
    if (tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }
    
    try {
      await createPostMutation.mutateAsync(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    if (index < images.length) {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    } else {
      const videoIndex = index - images.length;
      const newVideos = [...videos];
      newVideos.splice(videoIndex, 1);
      setVideos(newVideos);
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pb-32 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Nova Publicação</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="content" className="block mb-2">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="O que você está pensando?"
              className="min-h-[150px]"
              required
            />
          </div>
          
          {/* Tags input */}
          <div className="mb-6">
            <Label htmlFor="tags" className="block mb-2">Tags</Label>
            <div className="flex">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Adicione tags para sua publicação"
                className="mr-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleTagAdd}
                variant="outline"
              >
                <Tag size={18} />
              </Button>
            </div>
          </div>
          
          {/* Display tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map(tag => (
                <div 
                  key={tag} 
                  className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center dark:bg-gray-800"
                >
                  #{tag}
                  <button 
                    type="button" 
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Display city from profile */}
          {userCity && (
            <div className="mb-6">
              <Label className="block mb-2">Localização</Label>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <span>{userCity}</span>
              </div>
            </div>
          )}
          
          {/* Media upload */}
          <div className="mb-6">
            <Label className="block mb-2">Mídia (máximo 10 arquivos)</Label>
            <div className="flex items-center">
              <label className="cursor-pointer">
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <Upload size={24} className="mr-2" />
                  <span>Upload de imagens/vídeos</span>
                </div>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleImageChange} 
                  accept="image/*,video/*" 
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Media previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {previews.map((preview, index) => (
                <div key={index} className="relative h-24 bg-gray-100 rounded overflow-hidden">
                  {index < images.length ? (
                    <img src={preview} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-800">
                      <Camera size={24} className="text-white" />
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => navigate('/posts')}
              variant="outline"
              className="px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-4"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </form>
      </div>
      
      <BottomNav />
    </div>
  );
}
