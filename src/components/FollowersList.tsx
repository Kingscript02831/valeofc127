import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { UserPlus, UserMinus, Loader2, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent } from "./ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import type { Profile } from "../types/profile";

interface FollowersListProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "followers" | "following" | "notFollowing";
}

type FollowStatus = "follow" | "unfollow" | "remove";

const FollowersList = ({ userId, isOpen, onClose, initialTab = "followers" }: FollowersListProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"followers" | "following" | "notFollowing">(initialTab);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          follower_id,
          follower:follower_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("following_id", userId);

      if (error) {
        console.error("Erro ao buscar seguidores:", error);
        return [];
      }

      return data.map(item => item.follower as Profile);
    },
    enabled: isOpen && userId !== null,
  });

  const { data: following, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          following_id,
          following:following_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("follower_id", userId);

      if (error) {
        console.error("Erro ao buscar seguidos:", error);
        return [];
      }

      return data.map(item => item.following as Profile);
    },
    enabled: isOpen && userId !== null,
  });

  const { data: allUsers, isLoading: isLoadingAllUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .neq("id", userId)
        .limit(50);

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        return [];
      }

      return data as Profile[];
    },
    enabled: isOpen && activeTab === "notFollowing" && userId !== null,
  });

  const notFollowing = React.useMemo(() => {
    if (!allUsers || !following) return [];
    
    const followingIds = new Set(following.map(user => user.id));
    return allUsers.filter(user => !followingIds.has(user.id));
  }, [allUsers, following]);

  const mutateFollow = useMutation({
    mutationFn: async ({ targetId, action }: { targetId: string, action: FollowStatus }) => {
      if (!currentUserId) throw new Error("Usuário não autenticado");

      if (action === "follow") {
        const { error } = await supabase
          .from("follows")
          .insert([
            { follower_id: currentUserId, following_id: targetId }
          ]);
        
        if (error) throw error;
        
        return { targetId, action };
      } else if (action === "unfollow" || action === "remove") {
        const follower = action === "remove" ? targetId : currentUserId;
        const following = action === "remove" ? currentUserId : targetId;
        
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", follower)
          .eq("following_id", following);
        
        if (error) throw error;
        
        return { targetId, action };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
      queryClient.invalidateQueries({ queryKey: ["followStats", userId] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      
      if (result.action === "follow") {
        toast.success("Seguindo com sucesso!");
      } else if (result.action === "unfollow") {
        toast.success("Deixou de seguir com sucesso!");
      } else if (result.action === "remove") {
        toast.success("Seguidor removido com sucesso!");
      }
    },
    onError: (error) => {
      console.error("Erro na ação:", error);
      toast.error("Ocorreu um erro ao realizar esta ação");
    }
  });

  const checkIfFollowing = (profileId: string) => {
    if (!following) return false;
    return following.some(user => user.id === profileId);
  };

  const checkIfFollower = (profileId: string) => {
    if (!followers) return false;
    return followers.some(user => user.id === profileId);
  };

  const renderUserItem = (user: Profile, listType: "followers" | "following" | "notFollowing") => {
    if (!user || !user.id) return null;
    
    const isUserFollowing = checkIfFollowing(user.id);
    const isUserFollower = checkIfFollower(user.id);
    
    return (
      <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-700">
        <Link to={`/perfil/${user.username}`} className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={user.avatar_url || ""} alt={user.username || ""} />
            <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{user.full_name}</p>
            <p className="text-gray-400 text-xs">@{user.username}</p>
          </div>
        </Link>
        
        <div className="flex gap-2">
          {listType === "followers" && (
            <>
              {!isUserFollowing && user.id !== currentUserId && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => mutateFollow.mutate({ targetId: user.id, action: "follow" })}
                  disabled={mutateFollow.isPending}
                >
                  {mutateFollow.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                  Seguir
                </Button>
              )}
              {isUserFollowing && user.id !== currentUserId && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => mutateFollow.mutate({ targetId: user.id, action: "unfollow" })}
                  disabled={mutateFollow.isPending}
                >
                  {mutateFollow.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4 mr-1" />}
                  Seguindo
                </Button>
              )}
              {userId === currentUserId && (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => mutateFollow.mutate({ targetId: user.id, action: "remove" })}
                  disabled={mutateFollow.isPending}
                >
                  {mutateFollow.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 mr-1" />}
                  Remover
                </Button>
              )}
            </>
          )}
          
          {listType === "following" && (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => mutateFollow.mutate({ targetId: user.id, action: "unfollow" })}
              disabled={mutateFollow.isPending}
            >
              {mutateFollow.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4 mr-1" />}
              Deixar de seguir
            </Button>
          )}
          
          {listType === "notFollowing" && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => mutateFollow.mutate({ targetId: user.id, action: "follow" })}
              disabled={mutateFollow.isPending}
            >
              {mutateFollow.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
              Seguir
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <div className="h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Conexões</h2>
          
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "followers" | "following" | "notFollowing")} 
            className="flex-1"
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="followers">Seguidores</TabsTrigger>
              <TabsTrigger value="following">Seguindo</TabsTrigger>
              <TabsTrigger value="notFollowing">Não seguindo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="followers" className="mt-4 flex-1 overflow-y-auto">
              {isLoadingFollowers ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : followers && followers.length > 0 ? (
                <div>
                  {followers.map(user => renderUserItem(user, "followers"))}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-400">Nenhum seguidor encontrado</p>
              )}
            </TabsContent>
            
            <TabsContent value="following" className="mt-4 flex-1 overflow-y-auto">
              {isLoadingFollowing ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : following && following.length > 0 ? (
                <div>
                  {following.map(user => renderUserItem(user, "following"))}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-400">Você não está seguindo ninguém</p>
              )}
            </TabsContent>
            
            <TabsContent value="notFollowing" className="mt-4 flex-1 overflow-y-auto">
              {isLoadingAllUsers ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : notFollowing && notFollowing.length > 0 ? (
                <div>
                  {notFollowing.map(user => renderUserItem(user, "notFollowing"))}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-400">Nenhum usuário disponível</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FollowersList;
