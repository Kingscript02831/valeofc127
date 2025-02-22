
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { Plus } from "lucide-react";
import PhotoUrlDialog from "./PhotoUrlDialog";
import { MediaCarousel } from "./MediaCarousel";

const PostsMenu = () => {
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

      setNewPostContent("");
      setSelectedImages([]);
      setSelectedVideos([]);
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
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Textarea
            placeholder="O que você está pensando?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="mb-4"
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
              Postar
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
  );
};

export default PostsMenu;
