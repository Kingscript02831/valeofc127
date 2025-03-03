import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { useTheme } from "../components/ThemeProvider";
import ProfileTabs from "../components/ProfileTabs";
import { ArrowLeft, MapPin, Heart, Calendar, Globe, Instagram, UserPlus, UserCheck, Users } from "lucide-react";
import BottomNav from "../components/BottomNav";
import type { Profile } from "../types/profile";
import { toast } from "sonner";
import { format } from "date-fns";

const defaultAvatarImage = "/placeholder.svg";
const defaultCoverImage = "/placeholder.svg";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBeingFollowed, setIsBeingFollowed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !data) {
        navigate("/404");
        return null;
      }

      return data as Profile;
    },
  });

  const { data: followStats } = useQuery({
    queryKey: ["followStats", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { followers: 0, following: 0 };

      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id);

      return {
        followers: followersCount || 0,
        following: followingCount || 0
      };
    },
    enabled: !!profile?.id,
  });

  useQuery({
    queryKey: ["isFollowing", currentUserId, profile?.id],
    queryFn: async () => {
      if (!currentUserId || !profile?.id || currentUserId === profile.id) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', profile.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error);
        }
        setIsFollowing(false);
        return false;
      }

      setIsFollowing(!!data);
      return !!data;
    },
    enabled: !!currentUserId && !!profile?.id && currentUserId !== profile.id,
  });

  useQuery({
    queryKey: ["isBeingFollowed", currentUserId, profile?.id],
    queryFn: async () => {
      if (!currentUserId || !profile?.id || currentUserId === profile.id) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', profile.id)
        .eq('following_id', currentUserId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error checking if being followed:', error);
        }
        setIsBeingFollowed(false);
        return false;
      }

      setIsBeingFollowed(!!data);
      return !!data;
    },
    enabled: !!currentUserId && !!profile?.id && currentUserId !== profile.id,
  });

  const { data: userProducts } = useQuery({
    queryKey: ["userProducts", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", profile.id);

      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data } = await supabase
        .from("posts")
        .select(`
          *,
          user:user_id (
            username,
            full_name,
            avatar_url
          ),
          post_likes (
            reaction_type,
            user_id
          ),
          post_comments (
            id
          )
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      return data || [];
    },
    enabled: !!profile?.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId || !profile?.id) {
        throw new Error("User not authenticated or profile not found");
      }

      const { data, error } = await supabase
        .from('follows')
        .insert([
          { follower_id: currentUserId, following_id: profile.id }
        ]);

      if (error) throw error;

      await supabase
        .from('notifications')
        .insert([
          {
            user_id: profile.id,
            title: 'Novo seguidor',
            message: `@${currentUserId} começou a seguir você.`,
            type: 'system',
          }
        ]);

      return data;
    },
    onSuccess: () => {
      setIsFollowing(true);
      queryClient.invalidateQueries({ queryKey: ["followStats", profile?.id] });
      toast.success("Seguindo com sucesso!");
    },
    onError: (error) => {
      console.error("Error following user:", error);
      toast.error("Erro ao seguir usuário");
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId || !profile?.id) {
        throw new Error("User not authenticated or profile not found");
      }

      const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', profile.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsFollowing(false);
      queryClient.invalidateQueries({ queryKey: ["followStats", profile?.id] });
      toast.success("Deixou de seguir com sucesso!");
    },
    onError: (error) => {
      console.error("Error unfollowing user:", error);
      toast.error("Erro ao deixar de seguir usuário");
    }
  });

  const handleFollowAction = () => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    const lastActionTime = localStorage.getItem(`followAction_${profile?.id}`);
    const now = Date.now();
    const cooldownPeriod = 30000;

    if (lastActionTime) {
      const timeSinceLastAction = now - parseInt(lastActionTime);
      if (timeSinceLastAction < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastAction) / 1000);
        toast.error(`Aguarde ${remainingSeconds} segundos antes de alterar o status de seguir novamente.`);
        return;
      }
    }

    localStorage.setItem(`followAction_${profile?.id}`, now.toString());

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const formatRelationshipStatus = (status: string | null | undefined) => {
    if (!status) return null;
    const statusMap: Record<string, string> = {
      single: "Solteiro(a)",
      dating: "Namorando",
      widowed: "Viúvo(a)"
    };
    return statusMap[status] || status;
  };

  const formatBirthDate = (date: string | null | undefined) => {
    if (!date) return null;
    return format(new Date(date), "dd/MM/yyyy");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{profile.full_name}</h1>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-20">
        <div className="relative">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
            {profile.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Capa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultCoverImage;
                }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                <p className="text-gray-500">Sem Capa de Perfil</p>
              </div>
            )}
          </div>

          <div className="flex justify-end px-4 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-4 text-center">
              <Link to={`/seguidores/${profile.username}/followers`} className="cursor-pointer">
                <div>
                  <p className="font-semibold">{followStats?.followers || 0}</p>
                  <p className="text-sm text-gray-500">Seguidores</p>
                </div>
              </Link>
              <Link to={`/seguidores/${profile.username}/following`} className="cursor-pointer">
                <div>
                  <p className="font-semibold">{followStats?.following || 0}</p>
                  <p className="text-sm text-gray-500">Seguindo</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="relative -mt-16 px-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-black">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatarImage;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                    <p className="text-gray-500">Sem foto de perfil</p>
                  </div>
                )}
              </div>
            </div>
            
            {currentUserId && currentUserId !== profile.id && (
              <div className="absolute top-20 right-4">
                <Button 
                  onClick={handleFollowAction}
                  className={`bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  variant="secondary"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={18} />
                      <span>Seguindo</span>
                    </>
                  ) : isBeingFollowed ? (
                    <>
                      <UserPlus size={18} />
                      <span>Seguir de volta</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Seguir</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="px-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                  <p className="text-gray-400">@{profile.username}</p>
                  {profile.status && (
                    <p className="text-yellow-500 text-sm mt-1">
                      {profile.status}
                    </p>
                  )}
                </div>
              </div>

              {profile.city && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Mora em {profile.city}
                </p>
              )}

              <div className="space-y-2 mt-3">
                {profile.relationship_status && (
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {formatRelationshipStatus(profile.relationship_status)}
                  </p>
                )}
                
                {profile.birth_date && (
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatBirthDate(profile.birth_date)}
                  </p>
                )}
                
                <div className="flex flex-col gap-2 mt-2">
                  {profile.instagram_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 w-fit"
                      onClick={() => window.open(profile.instagram_url, '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                  )}
                  
                  {profile.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 w-fit"
                      onClick={() => window.open(profile.website, '_blank')}
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 w-fit"
                    onClick={() => navigate(`/seguidores/${profile.username}`)}
                  >
                    <Users className="h-4 w-4" />
                    Ver Contatos
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <ProfileTabs 
                  userProducts={userProducts} 
                  userPosts={userPosts}
                  isLoading={isLoadingPosts}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
