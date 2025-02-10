
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreatePostDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    try {
      setIsLoading(true);
      
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user) {
        toast.error("Você precisa estar logado para criar um post");
        return;
      }

      // Upload image to Supabase Storage
      const fileName = `${crypto.randomUUID()}-${selectedImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, selectedImage);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      // Create post in the database
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          image_url: publicUrl,
          caption,
          user_id: session.data.session.user.id
        });

      if (postError) {
        throw postError;
      }

      // Reset form and close dialog
      setSelectedImage(null);
      setPreviewUrl(null);
      setCaption("");
      setIsOpen(false);
      
      // Refresh posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast.success("Post criado com sucesso!");
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Erro ao criar post. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="image"
              className="block w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    Clique para selecionar uma imagem
                  </span>
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="caption" className="text-sm font-medium">
              Legenda
            </label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva uma legenda..."
              className="resize-none"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedImage || isLoading}
          >
            {isLoading ? "Criando post..." : "Criar post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
