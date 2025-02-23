
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/components/ThemeProvider";
import ProfileTabs from "./components/ProfileTabs";
import EditProfileDialog from "@/components/EditProfileDialog";
import EditPhotosButton from "@/components/EditPhotosButton";
import PhotoUrlDialog from "@/components/PhotoUrlDialog";
import { Profile, ProfileUpdateData } from "@/types/profile";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPhotoUrlDialog, setShowPhotoUrlDialog] = useState(false);
  const [photoType, setPhotoType] = useState<"avatar" | "cover">("avatar");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch profile data
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select()
        .eq("username", username)
        .single();

      if (error) throw error;
      return profiles as Profile;
    },
  });

  // Fetch follower count
  const { data: followerCount } = useQuery({
    queryKey: ["follower-count", profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile?.id);
      return count;
    },
    enabled: !!profile?.id,
  });

  // Fetch following count
  const { data: followingCount } = useQuery({
    queryKey: ["following-count", profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile?.id);
      return count;
    },
    enabled: !!profile?.id,
  });

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = async (values: ProfileUpdateData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", profile?.id);

      if (error) throw error;

      await refetchProfile();
      setShowEditProfile(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUrlSubmit = async (url: string) => {
    if (!profile) return;

    try {
      setIsLoading(true);
      const updateData = photoType === "avatar" 
        ? { avatar_url: url }
        : { cover_url: url };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      await refetchProfile();
      setShowPhotoUrlDialog(false);
      toast({
        title: "Foto atualizada",
        description: "Sua foto foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Erro ao atualizar foto",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (type: "avatar" | "cover") => {
    if (!profile) return;

    try {
      setIsLoading(true);
      const updateData = type === "avatar"
        ? { avatar_url: null }
        : { cover_url: null };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      await refetchProfile();
      toast({
        title: "Foto excluída",
        description: "Sua foto foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Erro ao excluir foto",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    setPhotoType("avatar");
    setShowPhotoUrlDialog(true);
  };

  const handleCoverClick = () => {
    setPhotoType("cover");
    setShowPhotoUrlDialog(true);
  };

  if (!profile) return null;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-accent overflow-hidden">
          {profile.cover_url && (
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="relative px-4 pb-4">
          <div className="flex justify-between items-start mt-[-48px]">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || ""} />
              <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex gap-2 mt-2">
              {isOwnProfile && (
                <>
                  <EditPhotosButton
                    onAvatarClick={handleAvatarClick}
                    onCoverClick={handleCoverClick}
                    onDeleteAvatar={() => handleDeletePhoto("avatar")}
                    onDeleteCover={() => handleDeletePhoto("cover")}
                  />
                  <Button
                    variant="outline"
                    className={`text-foreground border-gray-700`}
                    onClick={() => setShowEditProfile(true)}
                  >
                    Editar perfil
                  </Button>
                  <Button
                    variant="outline"
                    className={`text-foreground border-gray-700`}
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold text-foreground">
              {profile.full_name || profile.username}
            </h1>
            {profile.username && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="mt-2 text-foreground">{profile.bio}</p>
            )}

            <div className="mt-4 flex gap-4">
              <div>
                <span className="font-semibold text-foreground">{followerCount || 0}</span>{" "}
                <span className="text-muted-foreground">seguidores</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">{followingCount || 0}</span>{" "}
                <span className="text-muted-foreground">seguindo</span>
              </div>
            </div>
          </div>
        </div>

        <ProfileTabs profile={profile} />
      </div>

      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <EditProfileDialog
          profile={profile}
          onSubmit={handleEditProfile}
        />
      </Dialog>

      <Dialog open={showPhotoUrlDialog} onOpenChange={setShowPhotoUrlDialog}>
        <PhotoUrlDialog
          onSubmit={handlePhotoUrlSubmit}
          type={photoType}
        />
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
