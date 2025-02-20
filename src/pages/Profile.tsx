import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { ProfileConfig } from "@/components/profileconfig";
import { DeletePhotoDialog } from "@/components/profile/DeletePhotoDialog";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { toast } from "sonner";
import type { Profile } from "@/types/profile";

export default function Profile() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar perfil: " + error.message);
    },
  });

  const handleDeletePhoto = async () => {
    try {
      await updateProfile.mutateAsync({ avatar_url: null });
      setShowDeletePhotoDialog(false);
      toast.success("Foto de perfil removida com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover foto de perfil");
    }
  };

  const handleDeleteCover = async () => {
    try {
      await updateProfile.mutateAsync({ cover_url: null });
      setShowDeleteCoverDialog(false);
      toast.success("Foto de capa removida com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover foto de capa");
    }
  };

  const handleAvatarImageClick = () => {
    // Implementar lógica de upload de avatar
  };

  const handleCoverImageClick = () => {
    // Implementar lógica de upload de capa
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <ProfileHeader profile={profile} />
      <ProfileCard profile={profile} />

      <ProfileConfig 
        profile={profile}
        isPreviewMode={isPreviewMode}
        locations={[]}
        handleAvatarImageClick={handleAvatarImageClick}
        handleCoverImageClick={handleCoverImageClick}
        setShowDeletePhotoDialog={setShowDeletePhotoDialog}
        setShowDeleteCoverDialog={setShowDeleteCoverDialog}
        onSubmit={updateProfile.mutate}
      />

      <DeletePhotoDialog
        open={showDeletePhotoDialog}
        onOpenChange={setShowDeletePhotoDialog}
        onDelete={handleDeletePhoto}
        type="profile"
      />

      <DeletePhotoDialog
        open={showDeleteCoverDialog}
        onOpenChange={setShowDeleteCoverDialog}
        onDelete={handleDeleteCover}
        type="cover"
      />
    </div>
  );
}
