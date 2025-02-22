
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/components/ThemeProvider";
import ProfileTabs from "@/components/ProfileTabs";
import EditProfileDialog from "@/components/EditProfileDialog";
import EditPhotosButton from "@/components/EditPhotosButton";
import PhotoUrlDialog from "@/components/PhotoUrlDialog";
import { ProfileData } from "@/types/profile";

interface Post {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  created_at: string;
}

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userProducts, setUserProducts] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;

      if (!profiles) {
        navigate('/404');
        return;
      }

      setProfileData(profiles);
      setIsCurrentUser(currentUser?.id === profiles.id);

      // Fetch follower count
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profiles.id);

      setFollowersCount(followers || 0);

      // Check if current user is following this profile
      if (currentUser) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profiles.id)
          .single();

        setIsFollowing(!!followData);
      }

      // Fetch user posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profiles.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setUserPosts(posts || []);

      // Fetch user products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', profiles.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setUserProducts(products || []);

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar o perfil",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para seguir",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileData?.id);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profileData?.id,
          });
      }

      setIsFollowing(!isFollowing);
      setFollowersCount(prevCount => isFollowing ? prevCount - 1 : prevCount + 1);

    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Erro",
        description: "Erro ao seguir usuário",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao sair",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl mx-auto pt-20 pb-24">
        <Card className="rounded-none sm:rounded-lg shadow-none sm:shadow-md border-0 sm:border">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 border-2 border-primary/10">
                  <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {profileData.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isCurrentUser && (
                  <EditPhotosButton onClick={() => setShowPhotoDialog(true)} />
                )}
              </div>

              <div className="space-y-1 mb-4">
                {profileData.full_name && (
                  <h2 className="text-2xl font-bold">{profileData.full_name}</h2>
                )}
                <p className="text-muted-foreground">@{profileData.username}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="text-center">
                  <p className="font-semibold">{followersCount}</p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
              </div>

              {isCurrentUser ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditProfile(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                >
                  {isFollowing ? "Deixar de Seguir" : "Seguir"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <ProfileTabs
            userId={profileData.id}
            userPosts={userPosts}
            userProducts={userProducts}
          />
        </div>
      </main>

      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        currentData={profileData}
        onSave={fetchProfile}
      />

      <PhotoUrlDialog
        open={showPhotoDialog}
        onOpenChange={setShowPhotoDialog}
        onSave={fetchProfile}
      />

      <BottomNav />
    </div>
  );
}

