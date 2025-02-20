import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from '@/integrations/supabase/client';
import type { Profile, ProfileUpdateData } from '@/types/profile';

export default function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatedProfileData, setUpdatedProfileData] = useState<ProfileUpdateData>({});
  const navigate = useNavigate();
  const { toast } = useToast()
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (user && user.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "There was a problem fetching your profile. Please try again.",
            })
          }

          if (data) {
            setProfile(data);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
    if (!isEditMode) {
      // When entering edit mode, initialize updatedProfileData with current profile values
      setUpdatedProfileData({
        username: profile?.username || '',
        full_name: profile?.full_name || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
      });
    }
  };

  const saveChanges = async () => {
    setLoading(true);
    try {
      if (user && user.id) {
        const { error } = await supabase
          .from('profiles')
          .update(updatedProfileData)
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        // Optimistically update the profile state
        setProfile(prev => ({ ...prev, ...updatedProfileData } as Profile));
        toast({
          title: "Profile updated successfully!",
        })
        setIsEditMode(false); // Exit edit mode after successful save
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem updating your profile. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const handleCoverImageClick = useCallback(() => {
    coverFileInputRef.current?.click();
  }, []);

  const handleCoverImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

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
    } catch (error) {
      console.error('Error uploading cover image:', error);
    }
  }, [user?.id]);

  const handleDeleteCover = async () => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: null })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, cover_url: null } : null);
      setShowDeleteCoverDialog(false);
    } catch (error) {
      console.error('Error deleting cover image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <input
        type="file"
        ref={coverFileInputRef}
        onChange={handleCoverImageUpload}
        accept="image/*"
        className="hidden"
      />
      <div className="relative">
        {profile?.cover_url ? (
          <div className="relative">
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-64 object-cover cursor-pointer"
              onClick={handleCoverImageClick}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full opacity-70 hover:opacity-100 transition"
              onClick={() => setShowDeleteCoverDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-64 rounded-none"
            onClick={handleCoverImageClick}
            disabled={loading}
          >
            {loading ? 'Loading...' : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Adicionar foto de capa
              </>
            )}
          </Button>
        )}
        <div className="absolute left-4 bottom-0 transform translate-y-1/2">
          {loading ? (
            <Skeleton className="h-24 w-24 rounded-full" />
          ) : (
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || user?.imageUrl} alt={profile?.full_name || user?.fullName} />
              <AvatarFallback>{profile?.username || user?.firstName}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4">
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Edit Profile' : profile?.full_name || user?.fullName || 'Profile'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update your profile information' : 'View your profile information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      defaultValue={profile?.username || ''}
                      disabled={!isEditMode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      type="text"
                      id="fullName"
                      name="full_name"
                      defaultValue={profile?.full_name || user?.fullName || ''}
                      disabled={!isEditMode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={profile?.bio || ''}
                    disabled={!isEditMode}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    type="url"
                    id="website"
                    name="website"
                    defaultValue={profile?.website || ''}
                    disabled={!isEditMode}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </CardContent>
          <div className="flex justify-end items-center p-4">
            {isEditMode ? (
              <>
                <Button
                  variant="ghost"
                  onClick={toggleEditMode}
                  disabled={loading}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveChanges}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={toggleEditMode} disabled={loading}>
                {loading ? 'Loading...' : 'Edit Profile'}
              </Button>
            )}
          </div>
        </Card>
        <Button variant="link" onClick={navigateToHome}>
          Go to Home
        </Button>
      </div>
      {showDeleteCoverDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confirmar exclusão</h3>
            <p className="mb-4">Tem certeza que deseja remover sua foto de capa?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteCoverDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCover}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
