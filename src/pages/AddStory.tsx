
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, Image } from 'lucide-react';

const AddStory: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Por favor, selecione uma imagem para o seu story");
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
      
      // Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `stories/${user.id}/${fileName}`;
      
      // Check if the stories folder exists, if not create it
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      // Save story to database
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          duration: 5000 // 5 seconds
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
            <div className="flex flex-col items-center justify-center">
              {previewUrl ? (
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                  <img 
                    src={previewUrl} 
                    alt="Story preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="absolute bottom-4 right-4"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Trocar imagem
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 w-full text-center">
                  <div className="flex flex-col items-center">
                    <Image className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Selecione uma imagem para o seu story
                    </p>
                    <Input
                      type="file"
                      id="story-image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="story-image">
                      <Button type="button" variant="secondary" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar imagem
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !file}
            >
              {loading ? "Adicionando..." : "Adicionar Story"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStory;
