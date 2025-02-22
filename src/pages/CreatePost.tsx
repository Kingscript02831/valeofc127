
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import PhotoUrlDialog from "../components/PhotoUrlDialog";

export default function CreatePost() {
  const [newPostContent, setNewPostContent] = useState("");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleCreatePost = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: session.user.id,
        content: newPostContent,
        images: selectedImages,
        video_urls: selectedVideos,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar post");
      return;
    }

    toast.success("Post criado com sucesso!");
    setNewPostContent("");
    setSelectedImages([]);
    setSelectedVideos([]);
    navigate("/posts");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Textarea
            placeholder="O que você está pensando?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPhotoDialogOpen(true)}
            >
              Adicionar Foto
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsVideoDialogOpen(true)}
            >
              Adicionar Vídeo
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
}
