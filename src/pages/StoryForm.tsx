
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Camera, Video } from "lucide-react";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import { MediaCarousel } from "../components/MediaCarousel";

const StoryForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<
    { type: "image" | "video"; url: string }[]
  >([]);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const createStoryMutation = useMutation({
    mutationFn: async (media: { type: "image" | "video"; url: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar autenticado");

      const { data, error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          media_url: media.url,
          media_type: media.type,
          // expires_at será preenchido automaticamente pelo valor padrão na tabela
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      toast.success("História adicionada com sucesso!");
      navigate("/");
    },
    onError: (error) => {
      console.error("Error creating story:", error);
      toast.error("Erro ao adicionar história. Tente novamente.");
    },
  });

  const handleMediaAdd = (url: string, type: "image" | "video") => {
    setSelectedMedia([{ type, url }]);
  };

  const handleSubmit = async () => {
    if (selectedMedia.length === 0) {
      toast.error("Por favor, adicione uma imagem ou vídeo");
      return;
    }
    
    setIsUploading(true);
    try {
      await createStoryMutation.mutateAsync(selectedMedia[0]);
    } catch (error) {
      console.error("Error submitting story:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-14 pb-20">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white/90 dark:bg-black/90 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Novo Story</h1>
        <div className="w-10" />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Card className="overflow-hidden bg-white dark:bg-card border-none shadow-sm">
          <CardContent className="p-4">
            {selectedMedia.length > 0 ? (
              <div className="mb-4">
                <MediaCarousel
                  images={selectedMedia.filter(m => m.type === "image").map(m => m.url)}
                  videoUrls={selectedMedia.filter(m => m.type === "video").map(m => m.url)}
                  title="Preview do Story"
                  autoplay={true}
                  showControls={true}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 gap-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg mb-4">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Adicione uma imagem ou vídeo para o seu story
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setIsPhotoDialogOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Camera size={18} />
                    Imagem
                  </Button>
                  <Button
                    onClick={() => setIsVideoDialogOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Video size={18} />
                    Vídeo
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4">
              {selectedMedia.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setSelectedMedia([])}
                  className="flex-1"
                >
                  Remover
                </Button>
              )}
              
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                disabled={selectedMedia.length === 0 || isUploading}
              >
                {isUploading ? "Publicando..." : "Publicar Story"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para adicionar imagem do Dropbox */}
      <PhotoUrlDialog
        isOpen={isPhotoDialogOpen}
        onClose={() => setIsPhotoDialogOpen(false)}
        onConfirm={(url) => handleMediaAdd(url, "image")}
        title="Adicionar Imagem"
      />

      {/* Dialog para adicionar vídeo do Dropbox */}
      <PhotoUrlDialog
        isOpen={isVideoDialogOpen}
        onClose={() => setIsVideoDialogOpen(false)}
        onConfirm={(url) => handleMediaAdd(url, "video")}
        title="Adicionar Vídeo"
      />
    </div>
  );
};

export default StoryForm;
