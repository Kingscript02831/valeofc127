
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import ProfileTabs from "@/components/ProfileTabs";
import { ArrowLeft, MapPin, Heart, Calendar, Globe, Instagram, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import type { Profile } from "@/types/profile";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const defaultAvatarImage = "/placeholder.svg";
const defaultCoverImage = "/placeholder.svg";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

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

  const { data: existingChat } = useQuery({
    queryKey: ["existingChat", currentUser?.id, profile?.id],
    queryFn: async () => {
      if (!currentUser?.id || !profile?.id) return null;

      const { data } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats!inner(id)
        `)
        .eq('user_id', currentUser.id)
        .in('chat_id', (
          supabase
            .from('chat_participants')
            .select('chat_id')
            .eq('user_id', profile.id)
        ));

      return data?.[0]?.chat_id || null;
    },
    enabled: !!currentUser?.id && !!profile?.id,
  });

  const createChatMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!profile?.id || !currentUser?.id) {
          throw new Error("No profile ID or user ID");
        }
        setIsLoadingChat(true);

        // Primeiro passo: Verificar se já existe um chat entre os usuários
        const { data: existingChats } = await supabase
          .from('chat_participants')
          .select(`
            chat_id,
            chats!inner(id)
          `)
          .eq('user_id', currentUser.id)
          .in('chat_id', (
            supabase
              .from('chat_participants')
              .select('chat_id')
              .eq('user_id', profile.id)
          ));

        // Se existir, retorna o ID do chat existente
        if (existingChats && existingChats.length > 0) {
          return existingChats[0].chat_id;
        }

        // Segundo passo: Criar um novo chat
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({})
          .select()
          .single();

        if (chatError) {
          console.error("Error creating chat:", chatError);
          throw chatError;
        }

        const timestamp = new Date().toISOString();

        // Terceiro passo: Adicionar os participantes ao chat
        const { error: participantsError } = await supabase
          .from('chat_participants')
          .insert([
            { 
              chat_id: newChat.id, 
              user_id: currentUser.id,
              last_read_at: timestamp
            },
            { 
              chat_id: newChat.id, 
              user_id: profile.id,
              last_read_at: timestamp
            }
          ]);

        if (participantsError) {
          console.error("Error adding participants:", participantsError);
          throw participantsError;
        }

        return newChat.id;
      } catch (error) {
        console.error("Error in create chat mutation:", error);
        throw error;
      }
    },
    onSuccess: (chatId) => {
      setIsLoadingChat(false);
      navigate(`/chat/${chatId}`);
    },
    onError: (error) => {
      setIsLoadingChat(false);
      console.error("Error creating chat:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleStartChat = async () => {
    if (!currentUser) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para iniciar uma conversa.",
        variant: "destructive",
      });
      return navigate("/login");
    }

    if (currentUser.id === profile?.id) {
      toast({
        title: "Atenção",
        description: "Você não pode iniciar uma conversa com você mesmo.",
        variant: "destructive",
      });
      return;
    }

    if (existingChat) {
      navigate(`/chat/${existingChat}`);
    } else {
      createChatMutation.mutate();
    }
  };

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
              <div>
                <p className="font-semibold">{followStats?.followers || 0}</p>
                <p className="text-sm text-gray-500">Seguidores</p>
              </div>
              <div>
                <p className="font-semibold">{followStats?.following || 0}</p>
                <p className="text-sm text-gray-500">Seguindo</p>
              </div>
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
                <Button 
                  onClick={handleStartChat}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isLoadingChat || currentUser?.id === profile.id}
                >
                  <MessageCircle className="h-4 w-4" />
                  {isLoadingChat ? 'Carregando...' : 'Conversar'}
                </Button>
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
