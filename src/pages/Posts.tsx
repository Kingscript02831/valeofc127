
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { useTheme } from "../components/ThemeProvider";
import MediaCarousel from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { MoreHorizontal, MessageCircle, Share2 } from "lucide-react";
import ReactionMenu from "../components/ReactionMenu";
import BottomNav from "../components/BottomNav";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import type { Post } from "../types/posts";
import { emojis, getEmojiByType } from "../utils/emojisPosts";
import Tags from "../components/Tags";
import { useToast } from "../components/ui/use-toast";

export default function Posts() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [reactionMenuVisible, setReactionMenuVisible] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Verifica se o usuário está autenticado
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };
    checkUser();
  }, []);

  // Busca todos os posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:user_id (
            username,
            full_name,
            avatar_url,
            city
          ),
          post_likes (
            reaction_type,
            user_id
          ),
          post_comments (
            id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar posts:", error);
        return [];
      }

      return data as Post[];
    },
  });

  // Busca os seguidores para saber se o usuário atual segue o usuário do post
  const { data: follows } = useQuery({
    queryKey: ["follows", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
        
      if (error) {
        console.error("Erro ao buscar seguidores:", error);
        return [];
      }
      
      return data.map(follow => follow.following_id);
    },
    enabled: !!userId
  });

  // Mutation para dar like em um post
  const likePost = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string, reactionType: string }) => {
      if (!userId) {
        navigate("/login");
        return;
      }

      // Verifica se o usuário já deu like no post
      const { data: existingLike } = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        // Se o tipo de reação for o mesmo, remove o like
        if (existingLike.reaction_type === reactionType) {
          await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId);
        } else {
          // Se o tipo de reação for diferente, atualiza o like
          await supabase
            .from("post_likes")
            .update({ reaction_type: reactionType })
            .eq("post_id", postId)
            .eq("user_id", userId);
        }
      } else {
        // Se não existir, insere um novo like
        await supabase
          .from("post_likes")
          .insert([
            { post_id: postId, user_id: userId, reaction_type: reactionType },
          ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setReactionMenuVisible(false);
    },
    onError: (error) => {
      console.error("Erro ao dar like:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  });

  // Mutation para seguir/deixar de seguir um usuário
  const toggleFollow = useMutation({
    mutationFn: async (followingId: string) => {
      if (!userId) {
        navigate("/login");
        return;
      }

      // Verifica se já segue
      const { data: existingFollow } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", userId)
        .eq("following_id", followingId)
        .single();

      if (existingFollow) {
        // Deixar de seguir
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", userId)
          .eq("following_id", followingId);
          
        return { action: 'unfollow' };
      } else {
        // Seguir
        await supabase
          .from("follows")
          .insert([
            { follower_id: userId, following_id: followingId },
          ]);
          
        return { action: 'follow' };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["follows", userId] });
      
      const action = data?.action;
      toast({
        title: action === 'follow' ? "Seguindo" : "Deixou de seguir",
        description: action === 'follow' ? 
          "Agora você está seguindo este usuário" : 
          "Você deixou de seguir este usuário",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seus seguidores",
        variant: "destructive",
      });
    }
  });

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: pt });
    } else {
      return format(date, "d 'de' MMMM 'às' HH:mm", { locale: pt });
    }
  };

  // Verifica se o usuário já deu like em um post
  const getUserReaction = (post: Post) => {
    if (!userId || !post.post_likes) return null;
    
    const userLike = post.post_likes.find(like => like.user_id === userId);
    return userLike?.reaction_type || null;
  };

  // Conta quantas reações de cada tipo um post tem
  const countReactions = (post: Post) => {
    if (!post.post_likes) return {};
    
    const counts: Record<string, number> = {};
    
    post.post_likes.forEach(like => {
      if (like.reaction_type) {
        counts[like.reaction_type] = (counts[like.reaction_type] || 0) + 1;
      }
    });
    
    return counts;
  };

  const isFollowing = (postUserId: string) => {
    return follows?.includes(postUserId) || false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Carregando posts...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Navbar />
      
      <div className="max-w-2xl mx-auto pb-20 pt-16 px-4">
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div 
                key={post.id} 
                className={`rounded-lg overflow-hidden ${
                  theme === "dark" ? "bg-gray-900" : "bg-white"
                } border ${
                  theme === "dark" ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        className="h-10 w-10 border-2 border-primary"
                        onClick={() => post.user?.username && navigate(`/perfil/${post.user.username}`)}
                      >
                        <AvatarImage 
                          src={post.user?.avatar_url || "/placeholder.svg"} 
                          alt={post.user?.username || "User"} 
                        />
                        <AvatarFallback>{post.user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p 
                          className={`font-semibold ${
                            theme === "dark" ? "text-white" : "text-black"
                          } cursor-pointer`}
                          onClick={() => post.user?.username && navigate(`/perfil/${post.user.username}`)}
                        >
                          {post.user?.username || "Usuário"}
                        </p>
                        {post.user?.city && (
                          <p className="text-sm text-gray-500">
                            {post.user.city}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {userId && post.user_id !== userId && (
                        <Button
                          variant={isFollowing(post.user_id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFollow.mutate(post.user_id)}
                          className={isFollowing(post.user_id) ? "bg-primary text-primary-foreground" : ""}
                        >
                          {isFollowing(post.user_id) ? "Seguindo" : "Seguir"}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`mb-3 ${theme === "dark" ? "text-white" : "text-black"}`}>
                    <p>{post.content}</p>
                  </div>
                  
                  {post.images?.length > 0 && (
                    <div className="mb-3 overflow-hidden rounded-lg">
                      <MediaCarousel media={post.images.map(url => ({ type: 'image', url }))} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-1">
                      {Object.entries(countReactions(post)).map(([type, count], index) => (
                        count > 0 && (
                          <div key={index} className="flex items-center">
                            <span className="text-xl">{getEmojiByType(type)}</span>
                            {index < Object.entries(countReactions(post)).length - 1 && <span className="mx-1"></span>}
                          </div>
                        )
                      ))}
                      {post.post_likes && post.post_likes.length > 0 && (
                        <span className="text-sm text-gray-500 ml-1">
                          {post.post_likes.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      {post.post_comments && (
                        <span className="mr-3">{post.post_comments.length} comentários</span>
                      )}
                      <span>{formatPostDate(post.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-3 mt-3 border-t border-gray-700">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center"
                        onClick={() => {
                          setSelectedPostId(post.id);
                          setReactionMenuVisible(!reactionMenuVisible);
                        }}
                      >
                        <span className="mr-1 text-xl">
                          {getUserReaction(post) 
                            ? getEmojiByType(getUserReaction(post) || "") 
                            : "👍"}
                        </span>
                        <span className={theme === "dark" ? "text-white" : "text-black"}>
                          {getUserReaction(post) ? getUserReaction(post) : "Curtir"}
                        </span>
                      </Button>
                      
                      {reactionMenuVisible && selectedPostId === post.id && (
                        <div className="absolute top-10 left-0 z-10">
                          <ReactionMenu
                            onSelect={(type) => {
                              likePost.mutate({ postId: post.id, reactionType: type });
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>Comentar</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      <span>Compartilhar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className={theme === "dark" ? "text-white" : "text-black"}>
                Nenhum post encontrado. Seja o primeiro a compartilhar algo!
              </p>
              <Button 
                className="mt-4"
                onClick={() => navigate("/postar")}
              >
                Criar Post
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
