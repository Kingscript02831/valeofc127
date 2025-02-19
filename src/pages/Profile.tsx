import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Trash2 } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import BottomNav from "../components/BottomNav";
import type { Profile } from "../types/profile";
import MediaCarousel from "../components/MediaCarousel";
import { ThemeProvider } from "../components/ThemeProvider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "sonner";
import { useUser } from "../components/UserProvider";
import ProfileHeader from "../components/ProfileHeader";
import ProfileInfo from "../components/ProfileInfo";
import ProfileGallery from "../components/ProfileGallery";
import ProfileFriends from "../components/ProfileFriends";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile.");
          return;
        }

        if (profileData) {
          setProfile(profileData);
          setIsOwnProfile(user?.id === profileData.id);
        } else {
          toast.error("Profile not found.");
          navigate("/404");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, navigate]);

  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, cover_url: publicUrl } : null);
      toast.success('Foto de capa atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar foto de capa');
      console.error('Error:', error);
    }
  };

  const handleDeleteCoverPhoto = async () => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: null })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, cover_url: null } : null);
      toast.success('Foto de capa removida com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover foto de capa');
      console.error('Error:', error);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <div className="relative w-full h-48">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: profile?.cover_url 
                ? `url(${profile.cover_url})` 
                : 'linear-gradient(to bottom, #1EAEDB, #0FA0CE)' 
            }}
          />
          {isOwnProfile && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <label className="cursor-pointer p-2 rounded-full bg-black/50 hover:bg-black/70">
                <Camera className="h-6 w-6 text-[#1EAEDB]" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverPhotoUpload}
                />
              </label>
              {profile?.cover_url && (
                <button
                  onClick={handleDeleteCoverPhoto}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/70"
                >
                  <Trash2 className="h-6 w-6 text-[#1EAEDB]" />
                </button>
              )}
            </div>
          )}
        </div>

        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

        <Tabs defaultValue="info" className="w-full p-4">
          <TabsList>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <Card>
              <CardContent className="p-4">
                <ProfileInfo profile={profile} isOwnProfile={isOwnProfile} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gallery">
            <Card>
              <CardContent className="p-4">
                <ProfileGallery profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="friends">
            <Card>
              <CardContent className="p-4">
                <ProfileFriends profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <BottomNav />
      </div>
    </ThemeProvider>
  );
};

export default ProfilePage;
