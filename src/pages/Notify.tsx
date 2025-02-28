
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Bell,
  ArrowLeft,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/components/ThemeProvider";
import type { Notification } from "@/types/database";

export default function Notify() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      } else {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return [];
      }
      
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          follower:follower_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  const { data: followData } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      if (!userId) return { following: [] };
      
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      if (error) {
        console.error("Error fetching following data:", error);
        return { following: [] };
      }
      
      return { 
        following: data?.map(item => item.following_id) || [] 
      };
    },
    enabled: !!userId
  });
  
  const followMutation = useMutation({
    mutationFn: async (followingId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: userId, following_id: followingId });
      
      if (error) throw error;
      return followingId;
    },
    onSuccess: (followingId) => {
      toast({
        title: "Seguindo com sucesso",
        description: "Você começou a seguir este usuário",
      });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao seguir",
        description: error instanceof Error ? error.message : "Ocorreu um erro",
        variant: "destructive",
      });
    }
  });
  
  const unfollowMutation = useMutation({
    mutationFn: async (followingId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', followingId);
      
      if (error) throw error;
      return followingId;
    },
    onSuccess: (followingId) => {
      toast({
        title: "Deixou de seguir",
        description: "Você não está mais seguindo este usuário",
      });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deixar de seguir",
        description: error instanceof Error ? error.message : "Ocorreu um erro",
        variant: "destructive",
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.type === 'follow' && notification.follower?.username) {
      navigate(`/perfil/${notification.follower.username}`);
    }
  };

  const handleFollow = (followerId: string) => {
    followMutation.mutate(followerId);
  };

  const handleUnfollow = (followerId: string) => {
    unfollowMutation.mutate(followerId);
  };

  const isFollowing = (followerId: string) => {
    return followData?.following.includes(followerId) || false;
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-semibold">Notificações</h1>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={() => navigate("/perfil")} className="flex items-center mr-4">
            <User className="h-6 w-6" />
          </button>
          <button onClick={async () => {
            await supabase.auth.signOut();
            navigate("/login");
          }} className="flex items-center">
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="pt-20 pb-24 px-4">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'} ${!notification.read ? (theme === 'light' ? 'border-l-4 border-blue-500' : 'border-l-4 border-blue-400') : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  {notification.type === 'follow' && notification.follower ? (
                    <>
                      <div className="mr-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          {notification.follower.avatar_url ? (
                            <img 
                              src={notification.follower.avatar_url} 
                              alt={notification.follower.username || 'avatar'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`}>
                              <User className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              @{notification.follower.username || 'usuário'} <span className="font-normal">começou a seguir você.</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            {isFollowing(notification.follower.id) ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUnfollow(notification.follower?.id || '')}
                              >
                                Seguindo
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleFollow(notification.follower?.id || '')}
                              >
                                Seguir de volta
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mr-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900'}`}>
                          <Bell className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm mt-1">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Você não tem notificações</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
