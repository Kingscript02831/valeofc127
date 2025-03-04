
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { ArrowLeft, UserCheck, UserPlus } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useTheme } from "../components/ThemeProvider";
import { toast } from "sonner";
import type { Profile } from "../types/profile";

interface FollowData {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profile: Profile; // This will store the follower or following profile
}

export default function Followers() {
  const { username, tab = "followers" } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    tab === "following" ? "following" : "followers"
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowingMap, setIsFollowingMap] = useState<Record<string, boolean>>({});

  // Update activeTab when route param changes
  useEffect(() => {
    setActiveTab(tab === "following" ? "following" : "followers");
  }, [tab]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        console.log("Current user ID:", session.user.id);
      } else {
        console.log("No active session found");
      }
    };
    fetchCurrentUser();
  }, []);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      if (!username) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          throw new Error("Não autenticado");
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching own profile:", error);
          navigate("/404");
          return null;
        }
        
        if (!data) {
          console.error("No profile data found for current user");
          navigate("/404");
          return null;
        }

        console.log("Current user profile:", data);
        return data as Profile;
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (error) {
          console.error("Error fetching profile by username:", error);
          navigate("/404");
          return null;
        }
        
        if (!data) {
          console.error("No profile found for username:", username);
          navigate("/404");
          return null;
        }

        console.log("Profile for username", username, ":", data);
        return data as Profile;
      }
    },
  });

  // Get followers count - separate query to ensure it's always current
  const { data: followersCount, refetch: refetchFollowersCount } = useQuery({
    queryKey: ["followersCount", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', profile.id);
      
      if (error) {
        console.error("Error fetching followers count:", error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  // Get following count - separate query to ensure it's always current
  const { data: followingCount, refetch: refetchFollowingCount } = useQuery({
    queryKey: ["followingCount", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', profile.id);
      
      if (error) {
        console.error("Error fetching following count:", error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  const { data: followers, isLoading: isFollowersLoading } = useQuery({
    queryKey: ["followers", profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        console.log("No profile ID for followers query");
        return [];
      }

      console.log("Fetching followers for profile ID:", profile.id);
      
      // First, get all followers of the profile
      const { data: followData, error: followError } = await supabase
        .from("follows")
        .select("id, follower_id, following_id, created_at")
        .eq("following_id", profile.id);

      if (followError) {
        console.error("Error fetching follows data:", followError);
        return [];
      }

      if (!followData || followData.length === 0) {
        console.log("No followers found for user", profile.id);
        return [];
      }

      console.log("Raw follows data:", followData);
      
      // Get the follower IDs
      const followerIds = followData.map(f => f.follower_id);
      
      // Now fetch the profile data for each follower
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", followerIds);
        
      if (profilesError) {
        console.error("Error fetching follower profiles:", profilesError);
        return [];
      }
      
      console.log("Follower profiles data:", profilesData);
      
      // Combine the follow data with profile data
      const result = followData.map(follow => {
        const profile = profilesData?.find(p => p.id === follow.follower_id);
        return {
          ...follow,
          profile: profile || null
        };
      }).filter(item => item.profile !== null);
      
      console.log("Combined follower data:", result);
      
      return result as FollowData[];
    },
    enabled: !!profile?.id,
  });

  const { data: following, isLoading: isFollowingLoading } = useQuery({
    queryKey: ["following", profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        console.log("No profile ID for following query");
        return [];
      }

      console.log("Fetching following for profile ID:", profile.id);
      
      // Get all users that the profile is following
      const { data: followData, error: followError } = await supabase
        .from("follows")
        .select("id, follower_id, following_id, created_at")
        .eq("follower_id", profile.id);

      if (followError) {
        console.error("Error fetching following data:", followError);
        return [];
      }

      if (!followData || followData.length === 0) {
        console.log("User", profile.id, "is not following anyone");
        return [];
      }

      console.log("Raw following data:", followData);
      
      // Get the following IDs
      const followingIds = followData.map(f => f.following_id);
      
      // Now fetch the profile data for each following
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", followingIds);
        
      if (profilesError) {
        console.error("Error fetching following profiles:", profilesError);
        return [];
      }
      
      console.log("Following profiles data:", profilesData);
      
      // Combine the follow data with profile data
      const result = followData.map(follow => {
        const profile = profilesData?.find(p => p.id === follow.following_id);
        return {
          ...follow,
          profile: profile || null
        };
      }).filter(item => item.profile !== null);
      
      console.log("Combined following data:", result);
      
      return result as FollowData[];
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUserId) {
        console.log("No current user ID to check following status");
        return;
      }
      
      const allProfiles = [
        ...(followers || []).map(f => f.profile?.id).filter(Boolean),
        ...(following || []).map(f => f.profile?.id).filter(Boolean)
      ] as string[];
      
      if (allProfiles.length === 0) {
        console.log("No users to check following status");
        return;
      }

      const uniqueUserIds = [...new Set(allProfiles)];
      console.log("Checking following status for users:", uniqueUserIds);
      
      const filteredUserIds = uniqueUserIds.filter(id => id !== currentUserId);
      
      if (filteredUserIds.length === 0) {
        console.log("No users to check after filtering out current user");
        return;
      }

      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', filteredUserIds);

      if (error) {
        console.error('Error checking follow status:', error);
        return;
      }

      console.log("Follow status results:", data);

      const followingMap: Record<string, boolean> = {};
      filteredUserIds.forEach(id => {
        followingMap[id] = false;
      });

      data?.forEach(item => {
        followingMap[item.following_id] = true;
      });

      console.log("Generated following map:", followingMap);
      setIsFollowingMap(followingMap);
    };

    if ((followers && followers.length > 0) || (following && following.length > 0)) {
      checkFollowingStatus();
    }
  }, [currentUserId, followers, following]);

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUserId) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from('follows')
        .insert([
          { follower_id: currentUserId, following_id: userId }
        ]);

      if (error) throw error;

      try {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: userId,
              title: 'Novo seguidor',
              message: `Alguém começou a seguir você.`,
              type: 'follow',
            }
          ]);
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Continue despite notification error
      }

      return data;
    },
    onSuccess: (_, userId) => {
      setIsFollowingMap(prev => ({ ...prev, [userId]: true }));
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["followersCount"] });
      queryClient.invalidateQueries({ queryKey: ["followingCount"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["isBeingFollowed"] });
      
      // Explicitly refetch the counts
      refetchFollowersCount();
      refetchFollowingCount();
      
      toast.success("Seguindo com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao seguir usuário:", error);
      toast.error("Erro ao seguir usuário");
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUserId) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      setIsFollowingMap(prev => ({ ...prev, [userId]: false }));
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["followersCount"] });
      queryClient.invalidateQueries({ queryKey: ["followingCount"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["isBeingFollowed"] });
      
      // Explicitly refetch the counts
      refetchFollowersCount();
      refetchFollowingCount();
      
      toast.success("Deixou de seguir com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao deixar de seguir usuário:", error);
      toast.error("Erro ao deixar de seguir usuário");
    }
  });

  const handleFollowAction = (userId: string) => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    const lastActionTime = localStorage.getItem(`followAction_${userId}`);
    const now = Date.now();
    const cooldownPeriod = 30000; // 30 seconds

    if (lastActionTime) {
      const timeSinceLastAction = now - parseInt(lastActionTime);
      if (timeSinceLastAction < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastAction) / 1000);
        toast.error(`Aguarde ${remainingSeconds} segundos antes de alterar o status de seguir novamente.`);
        return;
      }
    }

    localStorage.setItem(`followAction_${userId}`, now.toString());

    if (isFollowingMap[userId]) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "followers" | "following");
    
    // Update the URL without navigating to a different route
    if (username) {
      navigate(`/seguidores/${username}/${value}`, { replace: true });
    } else {
      // This was causing the issue - we need to maintain the routing structure consistency
      navigate(`/seguidores/${value}`, { replace: true });
    }
  };

  const renderUserList = (data: FollowData[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-8">
          <p>Carregando...</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-gray-500">
            {activeTab === "followers" ? "Nenhum seguidor ainda" : "Não está seguindo ninguém"}
          </p>
        </div>
      );
    }

    console.log("Dados dos usuários:", data);

    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {data.map((item) => {
          if (!item.profile) {
            console.warn("Item missing profile data:", item);
            return null;
          }
          
          return (
            <div key={item.id} className="flex items-center justify-between py-4 px-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer" 
                onClick={() => navigate(`/perfil/${item.profile.username}`)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={item.profile.avatar_url || "/placeholder.svg"} 
                    alt={item.profile.username || "usuário"} 
                  />
                  <AvatarFallback>
                    {(item.profile.full_name || item.profile.username || "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.profile.full_name}</p>
                  <p className="text-sm text-gray-500">@{item.profile.username}</p>
                </div>
              </div>
              
              {currentUserId && currentUserId !== item.profile.id && (
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowAction(item.profile.id);
                  }}
                  className={`bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  variant="secondary"
                  size="sm"
                >
                  {isFollowingMap[item.profile.id] ? (
                    <>
                      <UserCheck size={16} />
                      <span>Seguindo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Seguir</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const title = username ? `@${username}` : "Seus Contatos";

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="pt-16 pb-20">
        <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Seguidores {followersCount !== undefined ? `(${followersCount})` : ''}
            </TabsTrigger>
            <TabsTrigger value="following">
              Seguindo {followingCount !== undefined ? `(${followingCount})` : ''}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="followers">
            {renderUserList(followers, isFollowersLoading)}
          </TabsContent>
          <TabsContent value="following">
            {renderUserList(following, isFollowingLoading)}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
