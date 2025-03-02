
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Image, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import PhotoUrlDialog from '@/components/PhotoUrlDialog';
import MediaCarousel from '@/components/MediaCarousel';

const AddStory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const navigate = useNavigate();
  
  // Image URL dialog
  const [showImageUrlDialog, setShowImageUrlDialog] = useState(false);
  const [showVideoUrlDialog, setShowVideoUrlDialog] = useState(false);
  
  const handleAddImageUrl = (url: string) => {
    if (!url) return;
    
    // Convert Dropbox URL if needed
    let finalUrl = url;
    if (finalUrl.includes('dropbox.com')) {
      // Remove dl=0 if exists
      finalUrl = finalUrl.replace(/[&?]dl=0/g, '');
      
      // Add dl=1 at the end
      finalUrl = finalUrl.includes('?') ? `${finalUrl}&dl=1` : `${finalUrl}?dl=1`;
    }
    
    setPreviewUrls([...previewUrls, finalUrl]);
  };
  
  const handleAddVideoUrl = (url: string) => {
    if (!url) return;
    
    // Convert Dropbox URL if needed
    let finalUrl = url;
    if (finalUrl.includes('dropbox.com')) {
      // Remove dl=0 if exists
      finalUrl = finalUrl.replace(/[&?]dl=0/g, '');
      
      // Add dl=1 at the end
      finalUrl = finalUrl.includes('?') ? `${finalUrl}&dl=1` : `${finalUrl}?dl=1`;
    }
    
    setVideoUrls([...videoUrls, finalUrl]);
  };
  
  const handleRemoveImage = (index: number) => {
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };
  
  const handleRemoveVideo = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (previewUrls.length === 0 && videoUrls.length === 0) {
      toast.error("Por favor, adicione pelo menos uma mídia para o seu story");
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para adicionar um story");
        navigate('/login');
        return;
      }
      
      // Set expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // First media is used as the main media
      const media = previewUrls.length > 0 ? previewUrls[0] : videoUrls[0];
      const mediaType = previewUrls.length > 0 ? 'image' : 'video';
      
      // Save story to database
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: media,
          media_type: mediaType,
          expires_at: expiresAt.toISOString()
        });
      
      if (storyError) throw storyError;
      
      toast.success("Story adicionado com sucesso!");
      navigate('/');
    } catch (error) {
      console.error('Error adding story:', error);
      toast.error('Erro ao adicionar story');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-white/90 dark:bg-black/90 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Novo Story</h1>
      </div>
      
      <div className="container mx-auto pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(previewUrls.length > 0 || videoUrls.length > 0) && (
              <div className="mb-4">
                <MediaCarousel
                  images={previewUrls}
                  videoUrls={videoUrls}
                  title="Preview do Story"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Adicionar mídia</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowImageUrlDialog(true)}
                    className="flex-1"
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Adicionar Imagem
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowVideoUrlDialog(true)}
                    className="flex-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    Adicionar Vídeo
                  </Button>
                </div>
              </div>
              
              {previewUrls.length > 0 && (
                <div>
                  <Label>Imagens ({previewUrls.length})</Label>
                  {previewUrls.map((url, index) => (
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
              )}
              
              {videoUrls.length > 0 && (
                <div>
                  <Label>Vídeos ({videoUrls.length})</Label>
                  {videoUrls.map((url, index) => (
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
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || (previewUrls.length === 0 && videoUrls.length === 0)}
            >
              {loading ? "Adicionando..." : "Adicionar Story"}
            </Button>
          </form>
        </div>
      </div>
      
      {/* Dialogs for URL input */}
      <PhotoUrlDialog
        isOpen={showImageUrlDialog}
        onClose={() => setShowImageUrlDialog(false)}
        onConfirm={handleAddImageUrl}
        title="Adicionar imagem do Dropbox"
      />
      
      <PhotoUrlDialog
        isOpen={showVideoUrlDialog}
        onClose={() => setShowVideoUrlDialog(false)}
        onConfirm={handleAddVideoUrl}
        title="Adicionar vídeo do Dropbox"
      />
    </div>
  );
};

export default AddStory;
