import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Search } from "lucide-react";
import { MediaCarousel } from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LupaUsuario from "@/components/lupausuario";
import Tags from "@/components/Tags";

interface UserPost {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  created_at: string;
}

const PostForm = () => {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchUserPosts();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .eq("id", user.id)
        .single();
      
      setCurrentUser(data);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserPosts(posts || []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /\B@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return [...new Set(mentions)];
  };

  const notifyMentionedUsers = async (content: string, postId: string) => {
    if (!currentUser) return;
    
    const mentions = extractMentions(content);
    if (mentions.length === 0) return;

    try {
      const { data: mentionedUsers, error } = await supabase
        .from("profiles")
        .select("id, username")
        .in("username", mentions);

      if (error) throw error;
      
      if (!mentionedUsers || mentionedUsers.length === 0) return;

      const { data: currentUserDetails } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", currentUser.id)
        .single();

      if (!currentUserDetails) {
        console.error("Could not get current user details");
        return;
      }
      
      const notifications = mentionedUsers.map(user => ({
        user_id: user.id,
        title: "Menção em publicação",
        message: `Você foi marcado em uma Publicação`,
        type: "mention",
        reference_id: postId,
        sender: {
          id: currentUserDetails.id,
          username: currentUserDetails.username,
          full_name: currentUserDetails.full_name || currentUserDetails.username,
          avatar_url: currentUserDetails.avatar_url || ""
        }
      }));

      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) throw notifError;
      
      console.log("Created mention notifications with sender data:", notifications);
    } catch (error) {
      console.error("Error creating mention notifications:", error);
    }
  };

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

      let postId;

      if (editingPost) {
        const { error } = await supabase
          .from("posts")
          .update({
            content: newPostContent,
            images: selectedImages,
            video_urls: selectedVideos,
          })
          .eq("id", editingPost);

        if (error) throw error;
        
        postId = editingPost;
        toast({
          title: "Sucesso",
          description: "Post atualizado com sucesso!",
        });
      } else {
        const { data, error } = await supabase.from("posts").insert({
          content: newPostContent,
          images: selectedImages,
          video_urls: selectedVideos,
          user_id: user.id,
        }).select('id').single();

        if (error) throw error;
        
        postId = data.id;
        toast({
          title: "Sucesso",
          description: "Post criado com sucesso!",
        });
      }

      await notifyMentionedUsers(newPostContent, postId);

      setNewPostContent("");
      setSelectedImages([]);
      setSelectedVideos([]);
      setEditingPost(null);
      fetchUserPosts();
    } catch (error) {
      console.error("Error with post:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar o post",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: UserPost) => {
    setEditingPost(post.id);
    setNewPostContent(post.content);
    setSelectedImages(post.images || []);
    setSelectedVideos(post.video_urls || []);
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso!",
      });

      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o post",
        variant: "destructive",
      });
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL de imagem válida",
        variant: "destructive"
      });
      return;
    }

    if (!newImageUrl.includes('dropbox.com')) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida do Dropbox",
        variant: "destructive"
      });
      return;
    }

    let directImageUrl = newImageUrl;
    if (newImageUrl.includes('www.dropbox.com')) {
      directImageUrl = newImageUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (!selectedImages.includes(directImageUrl)) {
      setSelectedImages([...selectedImages, directImageUrl]);
      setNewImageUrl("");
      toast({
        title: "Sucesso",
        description: "Imagem adicionada com sucesso!"
      });
    } else {
      toast({
        title: "Erro",
        description: "Esta imagem já foi adicionada",
        variant: "destructive"
      });
    }
  };

  const handleAddVideo = () => {
    if (!newVideoUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL de vídeo válida",
        variant: "destructive"
      });
      return;
    }

    const isDropboxUrl = newVideoUrl.includes('dropbox.com');
    const isYoutubeUrl = newVideoUrl.includes('youtube.com') || newVideoUrl.includes('youtu.be');

    if (!isDropboxUrl && !isYoutubeUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida do Dropbox ou YouTube",
        variant: "destructive"
      });
      return;
    }

    let directVideoUrl = newVideoUrl;
    if (isDropboxUrl && newVideoUrl.includes('www.dropbox.com')) {
      directVideoUrl = newVideoUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (!selectedVideos.includes(directVideoUrl)) {
      setSelectedVideos([...selectedVideos, directVideoUrl]);
      setNewVideoUrl("");
      toast({
        title: "Sucesso",
        description: "Vídeo adicionado com sucesso!"
      });
    } else {
      toast({
        title: "Erro",
        description: "Este vídeo já foi adicionado",
        variant: "destructive"
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
  };

  const handleTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewPostContent(text);
    setCursorPosition(e.target.selectionStart || 0);
    
    const lastChar = text.charAt(e.target.selectionStart - 1);
    if (lastChar === "@") {
      setShowUserSearch(true);
    }
  };

  const handleSelectUser = (username: string) => {
    if (textAreaRef.current) {
      const beforeAt = newPostContent.substring(0, cursorPosition - 1);
      const afterAt = newPostContent.substring(cursorPosition);
      
      const newContent = `${beforeAt}@${username} ${afterAt}`;
      setNewPostContent(newContent);
      
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          const newPosition = beforeAt.length + username.length + 2;
          textAreaRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
        }
      }, 0);
    }
  };
  
  const handleTextAreaClick = () => {
    if (textAreaRef.current) {
      setCursorPosition(textAreaRef.current.selectionStart || 0);
    }
  };

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && showUserSearch) {
      setShowUserSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 pt-20 pb-24">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                {editingPost ? "Editar post" : "Criar novo post"}
              </h2>
              <div className="relative">
                <Textarea
                  ref={textAreaRef}
                  placeholder="O que você está pensando? Digite @ para marcar usuários"
                  value={newPostContent}
                  onChange={handleTextAreaInput}
                  onClick={handleTextAreaClick}
                  onKeyDown={handleTextAreaKeyDown}
                  className="mb-4"
                  rows={6}
                />
                {showUserSearch && (
                  <LupaUsuario 
                    onClose={() => setShowUserSearch(false)} 
                    onSelectUser={handleSelectUser} 
                  />
                )}
              </div>
              
              {newPostContent && (
                <div className="p-3 bg-muted/50 rounded-md mb-4">
                  <Label className="text-sm text-muted-foreground mb-1">Preview:</Label>
                  <p className="whitespace-pre-wrap">
                    <Tags content={newPostContent} />
                  </p>
                </div>
              )}
              
              {(selectedImages.length > 0 || selectedVideos.length > 0) && (
                <div className="mb-4">
                  <MediaCarousel
                    images={selectedImages}
                    videoUrls={selectedVideos}
                    title="Preview"
                  />
                </div>
              )}
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Imagens do Dropbox</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Cole a URL compartilhada do Dropbox"
                    />
                    <Button type="button" onClick={handleAddImage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  {selectedImages.map((url, index) => (
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
                
                <div>
                  <Label>Vídeos (Dropbox ou YouTube)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="Cole a URL do Dropbox ou YouTube"
                    />
                    <Button type="button" onClick={handleAddVideo}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  {selectedVideos.map((url, index) => (
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
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && !selectedImages.length && !selectedVideos.length}
              >
                {editingPost ? "Salvar alterações" : "Publicar"}
              </Button>
              {editingPost && (
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => {
                    setEditingPost(null);
                    setNewPostContent("");
                    setSelectedImages([]);
                    setSelectedVideos([]);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Seus posts</h3>
            {userPosts.map((post) => (
              <Card key={post.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="mb-4 whitespace-pre-wrap">
                    <Tags content={post.content} />
                  </p>
                  {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                    <div className="mb-4">
                      <MediaCarousel
                        images={post.images || []}
                        videoUrls={post.video_urls || []}
                        title={post.content}
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PostForm;
