
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Image, Video, Camera, Upload } from "lucide-react";
import { toast } from "sonner";

export default function CreateStory() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if it's an image or video
    const fileType = selectedFile.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      toast.error('Por favor, selecione uma imagem ou um vídeo.');
      return;
    }

    setMediaType(fileType as 'image' | 'video');
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const uploadToStorage = async (): Promise<string> => {
    if (!file) throw new Error("Nenhum arquivo selecionado");
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Usuário não autenticado");
    
    const userId = userData.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `stories/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('stories')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data: urlData } = supabase.storage
      .from('stories')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Por favor, selecione uma imagem ou vídeo para o seu story.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Você precisa estar logado para criar um story.');
        return;
      }
      
      // Upload file to storage
      const mediaUrl = await uploadToStorage();
      
      // Calculate expiry (24 hours from now)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Insert story record
      const { error } = await supabase.from('stories').insert({
        user_id: userData.user.id,
        media_url: mediaUrl,
        caption: caption.trim() || null,
        expires_at: expiresAt.toISOString(),
        media_type: mediaType
      });
      
      if (error) throw error;
      
      toast.success('Story publicado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao publicar story:', error);
      toast.error('Erro ao publicar story. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b">
        <button 
          onClick={() => navigate('/')}
          className="text-foreground"
        >
          <X className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Criar Story</h1>
        <div className="w-6" />
      </div>

      <div className="container max-w-md mx-auto pt-20 pb-24 px-4">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Upload Area */}
            <div 
              className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[300px] cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {mediaType === 'image' ? (
                    <img src={preview} alt="Preview" className="max-h-[300px] max-w-full object-contain" />
                  ) : (
                    <video src={preview} controls className="max-h-[300px] max-w-full object-contain" />
                  )}
                  <button 
                    type="button"
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Upload className="h-12 w-12 mb-2" />
                  <p className="mb-1">Clique para selecionar um arquivo</p>
                  <p className="text-sm">ou arraste e solte aqui</p>
                  <div className="flex gap-4 mt-6">
                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Image className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs mt-1">Imagem</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs mt-1">Vídeo</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs mt-1">Câmera</span>
                    </div>
                  </div>
                </div>
              )}
              <Input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,video/*" 
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Caption */}
            <div>
              <Textarea
                placeholder="Adicione uma legenda ao seu story..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Story'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
