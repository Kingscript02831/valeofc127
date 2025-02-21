import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { useTheme } from "../components/ThemeProvider";
import ProfileTabs from "../components/ProfileTabs";
import EditProfileDialog from "../components/EditProfileDialog";
import EditPhotosButton from "../components/EditPhotosButton";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import type { Profile } from "../types/profile";
import { useSiteConfig } from "../hooks/useSiteConfig";
import BottomNav from "../components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isCoverDialogOpen, setIsCoverDialogOpen] = useState(false);
  const [avatarCount, setAvatarCount] = useState(0);
  const [coverCount, setCoverCount] = useState(0);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as Profile;
    },
  });

  useEffect(() => {
    if (profile?.avatar_url) {
      const count = (profile.avatar_url.match(/storage\/v1\/object\/public\/avatars/g) || []).length;
      setAvatarCount(count);
    }
    if (profile?.cover_url) {
      const count = (profile.cover_url.match(/storage\/v1\/object\/public\/covers/g) || []).length;
      setCoverCount(count);
    }
  }, [profile?.avatar_url, profile?.cover_url]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleAvatarClick = () => {
    setIsAvatarDialogOpen(true);
  };

  const handleCoverClick = () => {
    setIsCoverDialogOpen(true);
  };

  const handleDeleteAvatar = async () => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir sua foto de perfil?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", profile?.id);

    if (error) {
      toast.error("Erro ao excluir foto de perfil");
      return;
    }

    toast.success("Foto de perfil excluída com sucesso!");
    refetch();
  };

  const handleDeleteCover = async () => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir sua foto de capa?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("profiles").update({ cover_url: null }).eq("id", profile?.id);

    if (error) {
      toast.error("Erro ao excluir foto de capa");
      return;
    }

    toast.success("Foto de capa excluída com sucesso!");
    refetch();
  };

  const handlePhotoUpdate = useMutation(
    async ({ type, url }: { type: 'avatar' | 'cover'; url: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ [type === 'avatar' ? 'avatar_url' : 'cover_url']: url })
        .eq("id", profile?.id);

      if (error) {
        throw new Error(`Erro ao atualizar ${type === 'avatar' ? 'avatar' : 'cover'}: ${error.message}`);
      }
    },
    {
      onSuccess: () => {
        toast.success("Foto atualizada com sucesso!");
        setIsAvatarDialogOpen(false);
        setIsCoverDialogOpen(false);
        queryClient.invalidateQueries(["profile"]);
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao atualizar foto.");
      },
    }
  );

  const handleProfileUpdate = async (values: any) => {
    const { username, full_name, email, phone, website, birth_date, city, street, house_number, postal_code, status, location_id, basic_info_updated_at, relationship_status, instagram_url } = values;

    const updates = {
      id: profile?.id,
      username,
      full_name,
      email,
      phone,
      website,
      birth_date,
      city,
      street,
      house_number,
      postal_code,
      status,
      location_id,
      basic_info_updated_at,
      relationship_status,
      instagram_url,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      toast.error("Erro ao atualizar o perfil!");
    } else {
      toast.success("Perfil atualizado com sucesso!");
      setIsEditDialogOpen(false);
      refetch();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">{profile?.full_name}</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center">
          <LogOut className="h-6 w-6" />
        </button>
      </div>

      <div className="pt-16 pb-24">
        <Card className="w-full max-w-3xl mx-auto mt-8 p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-24 w-24 rounded-full border-2 border-primary">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Avatar"} />
              <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold">{profile?.full_name}</h2>
            <p className="text-gray-500">{profile?.status || "No status"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Informações</h3>
              <p><strong>Username:</strong> {profile?.username || "N/A"}</p>
              <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
              <p><strong>Telefone:</strong> {profile?.phone || "N/A"}</p>
              <p><strong>Website:</strong> {profile?.website || "N/A"}</p>
              {profile?.birth_date && (
                <p>
                  <strong>Idade:</strong> {differenceInYears(new Date(), new Date(profile.birth_date))} anos
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Endereço</h3>
              <p><strong>Cidade:</strong> {profile?.city || "N/A"}</p>
              <p><strong>Rua:</strong> {profile?.street || "N/A"}</p>
              <p><strong>Número:</strong> {profile?.house_number || "N/A"}</p>
              <p><strong>CEP:</strong> {profile?.postal_code || "N/A"}</p>
            </div>
          </div>

          <ProfileTabs profile={profile} />

          <Button onClick={() => setIsEditDialogOpen(true)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Editar Perfil
          </Button>
        </Card>
      </div>

      <EditPhotosButton 
        onAvatarClick={handleAvatarClick}
        onCoverClick={handleCoverClick}
        onDeleteAvatar={handleDeleteAvatar}
        onDeleteCover={handleDeleteCover}
        avatarCount={avatarCount}
        coverCount={coverCount}
      />

      <PhotoUrlDialog
        isOpen={isAvatarDialogOpen}
        onClose={() => setIsAvatarDialogOpen(false)}
        onConfirm={(url) => handlePhotoUpdate.mutate({ type: 'avatar', url })}
        title="Alterar foto de perfil"
      />

      <PhotoUrlDialog
        isOpen={isCoverDialogOpen}
        onClose={() => setIsCoverDialogOpen(false)}
        onConfirm={(url) => handlePhotoUpdate.mutate({ type: 'cover', url })}
        title="Alterar foto de capa"
      />

      <EditProfileDialog
        profile={profile}
        onSubmit={handleProfileUpdate}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}

export default Profile;
