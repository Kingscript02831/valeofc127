
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Check,
  Mail, 
  Phone, 
  Calendar,
  MessageSquare, 
  Link as LinkIcon, 
  MapPin,
  Instagram
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Navbar from "./Navbar";
import SubNav from "./SubNav";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Profile } from "@/types/database";
import { isFollowing, followUser, unfollowUser, getFollowerCount, getFollowingCount } from "@/lib/api/profile";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [following_loading, setFollowingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch current user's profile if logged in
        if (user) {
          const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setCurrentUser(currentUserProfile);

          // Check if current user is following the profile user
          if (id) {
            const isUserFollowing = await isFollowing(id);
            setFollowing(isUserFollowing);
          }
        }

        // Fetch profile of the user specified in the URL
        if (id) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (profileData) {
            setProfile(profileData);
            document.title = `${profileData.full_name || profileData.username} | Vale Notícias`;
            
            // Fetch follower and following counts
            const followers = await getFollowerCount(id);
            const following = await getFollowingCount(id);
            
            setFollowerCount(followers);
            setFollowingCount(following);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para seguir usuários');
      navigate('/login');
      return;
    }

    if (!id) return;

    setFollowingLoading(true);
    try {
      if (following) {
        await unfollowUser(id);
        setFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast.success('Você deixou de seguir este usuário');
      } else {
        await followUser(id);
        setFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success('Você está seguindo este usuário');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Erro ao atualizar status de seguir');
    } finally {
      setFollowingLoading(false);
    }
  };

  const startChat = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para enviar mensagens');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      // Create a chat or get existing chat ID
      const { data, error } = await supabase.rpc('create_private_chat', {
        other_user_id: id
      });

      if (error) throw error;

      // Navigate to the chat
      navigate(`/chat/${data}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Erro ao iniciar conversa');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
        <Navbar />
        <SubNav />
        <div className="flex-1 container mx-auto p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
        <Navbar />
        <SubNav />
        <div className="flex-1 container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mt-8">Perfil não encontrado</h1>
          <p className="text-muted-foreground mt-2">O usuário que você está procurando não existe ou foi removido.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>Voltar para a página inicial</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto p-4">
        <Card className="w-full mb-4 overflow-hidden">
          {/* Cover Photo */}
          <div 
            className="h-32 md:h-48 w-full bg-gradient-to-r from-primary/20 to-primary/40 relative"
            style={profile.cover_url ? { 
              backgroundImage: `url(${profile.cover_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            <div className="absolute -bottom-16 left-4">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                <AvatarFallback className="text-4xl">
                  {profile.username?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardHeader className="pt-20 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {profile.full_name || profile.username}
                  {profile.status && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {profile.status}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>@{profile.username}</CardDescription>
              </div>
              <div className="flex gap-2">
                {currentUser && currentUser.id !== profile.id && (
                  <>
                    <Button 
                      variant={following ? "outline" : "default"} 
                      onClick={handleFollowToggle}
                      disabled={following_loading}
                    >
                      {following ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Seguindo
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-1 h-4 w-4" />
                          Seguir
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={startChat}>
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-2">
            {/* Bio */}
            {profile.bio && (
              <p className="mb-4 text-sm">{profile.bio}</p>
            )}

            {/* Follower Stats */}
            <div className="flex gap-4 mb-4">
              <div className="text-center">
                <p className="font-semibold">{followerCount}</p>
                <p className="text-xs text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{followingCount}</p>
                <p className="text-xs text-muted-foreground">Seguindo</p>
              </div>
            </div>

            {/* Contact & Personal Info */}
            <div className="space-y-2">
              {profile.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-sm">
                  <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.instagram_url && (
                <div className="flex items-center text-sm">
                  <Instagram className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://instagram.com/${profile.instagram_url.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {profile.instagram_url}
                  </a>
                </div>
              )}
              {profile.location_name && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.location_name}</span>
                </div>
              )}
              {profile.birth_date && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Data de Nascimento: {format(new Date(profile.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              )}
              {profile.relationship_status && (
                <div className="flex items-center text-sm">
                  <span className="mr-2">❤️</span>
                  <span>{profile.relationship_status}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground pt-2">
            Membro desde {format(new Date(profile.created_at), 'MMMM yyyy', { locale: ptBR })}
          </CardFooter>
        </Card>

        {/* Additional sections like posts, photos, etc. could be added here */}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
