import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Profile } from "@/types/profile";
import { MediaCarousel } from "@/components/MediaCarousel";
import { useTheme } from "@/components/ThemeProvider";

const schema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
});

type ProfileForm = z.infer<typeof schema>;

export default function Profile() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [showDeleteAvatarDialog, setShowDeleteAvatarDialog] = useState(false);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const [showAddAvatarDialog, setShowAddAvatarDialog] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      bio: "",
      avatar_url: "",
    },
  });

  const { data: profile } = useQuery<Profile>(["profile"], async () => {
    const { data, error } = await supabase.from("profiles").select("*").single();
    if (error) throw error;
    return data;
  });

  const updateProfile = useMutation(
    async (values: ProfileForm) => {
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", profile?.id);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile"]);
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      },
      onError: () => {
        toast({
          title: "Erro ao atualizar perfil",
          description: "Ocorreu um erro ao tentar atualizar seu perfil.",
          variant: "destructive",
        });
      },
    }
  );

  const handleAvatarImageClick = () => {
    setShowAddAvatarDialog(true);
  };

  const handleAddAvatar = async (link: string) => {
    try {
      const values = {
        ...form.getValues(),
        avatar_url: link
      };
      form.setValue('avatar_url', link);
      updateProfile.mutate(values);
      setShowAddAvatarDialog(false);
      toast({
        title: "Foto de perfil atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar foto de perfil",
        description: "Ocorreu um erro ao tentar atualizar sua foto de perfil",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Perfil</h1>
        <div className="flex items-center mb-4">
          <div className="relative">
            <img
              src={profile?.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
              onClick={handleAvatarImageClick}
            />
            <Button
              variant="outline"
              className="absolute bottom-0 right-0"
              onClick={handleAvatarImageClick}
            >
              <Camera />
            </Button>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{profile?.username}</h2>
            <p className="text-gray-500">{profile?.bio}</p>
          </div>
        </div>

        {/* Empty States with consistent styling */}
        {activeTab === "posts" && (!posts || posts.length === 0) && (
          <div className={`w-full h-32 flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
            <p className="text-gray-500">Sem Posts</p>
          </div>
        )}
        
        {activeTab === "favorites" && (!favorites || favorites.length === 0) && (
          <div className={`w-full h-32 flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
            <p className="text-gray-500">Sem Favoritos</p>
          </div>
        )}
        
        {activeTab === "events" && (!events || events.length === 0) && (
          <div className={`w-full h-32 flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
            <p className="text-gray-500">Sem Eventos</p>
          </div>
        )}

        {/* Add Avatar Dialog */}
        <Dialog open={showAddAvatarDialog} onOpenChange={setShowAddAvatarDialog}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar foto de perfil</DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-gray-400">
              Cole o link da imagem do Dropbox para definir como sua foto de perfil
            </DialogDescription>
            <Input
              id="avatar-url"
              placeholder="Cole o link aqui"
              className="bg-gray-800 border-gray-700 text-white"
              onChange={(e) => setNewAvatarUrl(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddAvatarDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => handleAddAvatar(newAvatarUrl)}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </div>
  );
}
