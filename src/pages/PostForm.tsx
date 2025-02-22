
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import PhotoUrlDialog from "@/components/PhotoUrlDialog";
import MediaCarousel from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const PostForm = () => {
  const [newPostContent, setNewPostContent] = useState("");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreatePost = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um post",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase.from("posts").insert({
        content: newPostContent,
        images: selectedImages,
        video_urls: selectedVideos,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!",
      });

      navigate("/posts");
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar o post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 pt-20">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Criar novo post</h2>
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPhotoDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Foto
              </Button>
              <Button variant="outline" onClick={() => setIsVideoDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Vídeo
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && !selectedImages.length && !selectedVideos.length}
              >
                Publicar
              </Button>
            </div>
          </CardContent>
        </Card>

        <PhotoUrlDialog
          isOpen={isPhotoDialogOpen}
          onClose={() => setIsPhotoDialogOpen(false)}
          onConfirm={(url) => {
            setSelectedImages([...selectedImages, url]);
          }}
          title="Adicionar foto do Dropbox"
        />

        <PhotoUrlDialog
          isOpen={isVideoDialogOpen}
          onClose={() => setIsVideoDialogOpen(false)}
          onConfirm={(url) => {
            setSelectedVideos([...selectedVideos, url]);
          }}
          title="Adicionar vídeo do Dropbox"
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default PostForm;
