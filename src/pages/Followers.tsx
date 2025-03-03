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
  profile: Profile;
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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
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

        if (error || !data) {
          navigate("/404");
          return null;
        }

        return data as Profile;
      } else {
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
      }
    },
  });

  const { data: followers, isLoading: isFollowersLoading } = useQuery({
    queryKey: ["followers", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("follows")
        .select(`
          *,
          profile:follower_id(*)
        `)
        .eq("following_id", profile.id);

      if (error) {
        console.error("Erro ao buscar seguidores:", error);
        return [];
      }

      return (data || []) as FollowData[];
    },
    enabled: !!profile?.id,
  });

  const { data: following, isLoading: isFollowingLoading } = useQuery({
    queryKey: ["following", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("follows")
        .select(`
          *,
          profile:following_id(*)
        `)
        .eq("follower_id", profile.id);

      if (error) {
        console.error("Erro ao buscar seguindo:", error);
        return [];
      }

      return (data || []) as FollowData[];
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUserId) return;
      
      const usersToCheck = [
        ...(followers || []).map(f => f.profile.id),
        ...(following || []).map(f => f.profile.id)
      ];
      
      const uniqueUserIds = [...new Set(usersToCheck)];
      
      const filteredUserIds = uniqueUserIds.filter(id => id !== currentUserId);
      
      if (filteredUserIds.length === 0) return;

      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', filteredUserIds);

      if (error) {
        console.error('Erro ao verificar status de seguir:', error);
        return;
      }

      const followingMap: Record<string, boolean> = {};
      filteredUserIds.forEach(id => {
        followingMap[id] = false;
      });

      data.forEach(item => {
        followingMap[item.following_id] = true;
      });

      setIsFollowingMap(followingMap);
    };

    if (followers || following) {
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

      await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            title: 'Novo seguidor',
            message: `@${currentUserId} começou a seguir você.`,
            type: 'system',
          }
        ]);

      return data;
    },
    onSuccess: (_, userId) => {
      setIsFollowingMap(prev => ({ ...prev, [userId]: true }));
      queryClient.invalidateQueries({ queryKey: ["followStats", profile?.id] });
      queryClient.invalidateQueries({ queryKey: ["followers", profile?.id] });
      queryClient.invalidateQueries({ queryKey: ["following", profile?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["followStats", profile?.id] });
      queryClient.invalidateQueries({ queryKey: ["followers", profile?.id] });
      queryClient.invalidateQueries({ queryKey: ["following", profile?.id] });
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
    const cooldownPeriod = 30000;

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
    if (username) {
      navigate(`/seguidores/${username}/${value}`, { replace: true });
    } else {
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

    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {data.map((item) => (
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
        ))}
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
        <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Seguidores {followers?.length ? `(${followers.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="following">
              Seguindo {following?.length ? `(${following.length})` : ''}
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
