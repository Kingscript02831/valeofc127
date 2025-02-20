
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Trash2, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Profile } from "@/types/profile";

const defaultAvatarImage = "/placeholder.svg";
const defaultCoverImage = "/placeholder.svg";

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<Profile>();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso",
      });
      setIsPhotoDialogOpen(false);
    },
  });

  const handleDeleteAvatar = async () => {
    form.setValue("avatar_url", null);
    updateProfile.mutate({ avatar_url: null });
    setIsDeleteDialogOpen(false);
    toast({
      title: "Foto de perfil removida",
      description: "Sua foto de perfil foi removida com sucesso",
    });
  };

  const handleDeleteCover = async () => {
    form.setValue("cover_url", null);
    updateProfile.mutate({ cover_url: null });
    setIsDeleteDialogOpen(false);
    toast({
      title: "Foto de capa removida",
      description: "Sua foto de capa foi removida com sucesso",
    });
  };

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getValues();
    updateProfile.mutate({
      avatar_url: values.avatar_url,
      cover_url: values.cover_url,
      full_name: values.full_name,
      username: values.username
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <h1 className="text-xl font-semibold">Perfil</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="pt-16 pb-20">
        <div className="relative">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
            {profile?.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Capa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultCoverImage;
                }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
                <p className="text-gray-500">Sem Capa de Perfil</p>
              </div>
            )}
          </div>

          <div className="relative -mt-16 px-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-black">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatarImage;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
                    <p className="text-gray-500">Sem foto de perfil</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                onClick={() => setIsPhotoDialogOpen(true)}
                className="w-full"
              >
                Editar Foto
              </Button>
              <Button
                onClick={() => setIsPreviewMode(false)}
                className="w-full"
                variant="outline"
              >
                Editar Perfil
              </Button>
            </div>
          </div>

          {!isPreviewMode && (
            <div className="mt-8 px-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome de usuário
                  </label>
                  <Input
                    {...form.register("username")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome Completo
                  </label>
                  <Input
                    {...form.register("full_name")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Button type="submit" className="w-full">
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar fotos</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Foto de Perfil</h3>
              <Input 
                placeholder="Cole o link do Dropbox para a foto de perfil"
                defaultValue={profile?.avatar_url || ''}
                onChange={(e) => form.setValue("avatar_url", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Foto de Capa</h3>
              <Input 
                placeholder="Cole o link do Dropbox para a foto de capa"
                defaultValue={profile?.cover_url || ''}
                onChange={(e) => form.setValue("cover_url", e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              variant="destructive"
              onClick={() => {
                setIsPhotoDialogOpen(false);
                setIsDeleteDialogOpen(true);
              }}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir fotos
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => updateProfile.mutate({
              avatar_url: form.getValues("avatar_url"),
              cover_url: form.getValues("cover_url")
            })}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir fotos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteAvatar}
            >
              Excluir foto de perfil
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteCover}
            >
              Excluir foto de capa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
