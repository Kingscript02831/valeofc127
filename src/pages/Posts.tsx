
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import MediaCarousel from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import { Heart, MessageSquare, Share2, MoreHorizontal, MapPin, ChevronDown } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import ReactionMenu from "../components/ReactionMenu";
import BottomNav from "../components/BottomNav";
import { Drawer, DrawerContent, DrawerTrigger } from "../components/ui/drawer";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { emojiOptions } from "../utils/emojisPosts";
import Tags from "../components/Tags";

export default function Posts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // Buscar postagens
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:user_id (
            id,
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
            id,
            content,
            created_at,
            user:user_id (
              username,
              avatar_url
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar posts:", error);
        throw error;
      }

      return data || [];
    },
  });

  // Buscar perfil do usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
      }

      return data;
    },
  });

  // Mutação para dar like em um post
  const likeMutation = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string, reactionType: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      // Verificar se o usuário já deu like neste post
      const { data: existingLike } = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .single();

      if (existingLike) {
        // Se já deu like com o mesmo tipo de reação, remove o like
        if (existingLike.reaction_type === reactionType) {
          const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("id", existingLike.id);

          if (error) throw error;
          return { action: "removed" };
        } else {
          // Se deu like com outro tipo de reação, atualiza
          const { error } = await supabase
            .from("post_likes")
            .update({ reaction_type: reactionType })
            .eq("id", existingLike.id);

          if (error) throw error;
          return { action: "updated" };
        }
      } else {
        // Se não deu like ainda, adiciona
        const { error } = await supabase
          .from("post_likes")
          .insert([
            { post_id: postId, user_id: session.user.id, reaction_type: reactionType }
          ]);

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error("Erro ao reagir ao post: " + error.message);
    }
  });

  // Mutação para comentar em um post
  const commentMutation = useMutation({
    mutationFn: async ({ postId, comment }: { postId: string, comment: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("post_comments")
        .insert([
          { post_id: postId, user_id: session.user.id, content: comment }
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comentário adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar comentário: " + error.message);
    }
  });

  const handleLike = (postId: string, reactionType: string = "like") => {
    likeMutation.mutate({ postId, reactionType });
  };

  const handleReactionClick = (postId: string) => {
    setSelectedPostId(postId);
    setShowReactionMenu(true);
  };

  const handleComment = (postId: string) => {
    if (commentText.trim() === "") {
      toast.error("Comentário não pode estar vazio");
      return;
    }
    commentMutation.mutate({ postId, comment: commentText });
  };

  if (isLoadingPosts) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Carregando posts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container px-4 py-6 max-w-3xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Posts</h1>
          <Button onClick={() => navigate("/novo-post")} variant="secondary" className="bg-purple-700 hover:bg-purple-600">
            Novo Post
          </Button>
        </div>
        
        {posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <Link to={`/perfil/${post.user?.username}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                        {post.user?.avatar_url ? (
                          <img
                            src={post.user.avatar_url}
                            alt={post.user?.username || "Usuário"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-purple-700 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {post.user?.username?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{post.user?.full_name || post.user?.username}</p>
                        {post.user?.city && (
                          <p className="text-sm text-gray-400 flex items-center">
                            <MapPin size={12} className="mr-1" />
                            {post.user.city}
                          </p>
                        )}
                      </div>
                    </Link>
                    <button className="text-gray-400">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-200 whitespace-pre-line">{post.content}</p>
                  </div>
                </div>
                
                {post.images && post.images.length > 0 && (
                  <div className="w-full">
                    <MediaCarousel media={post.images.map((img: string) => ({ url: img, type: 'image' }))} />
                  </div>
                )}
                
                <div className="p-4 flex flex-col space-y-3">
                  <div className="flex justify-between items-center text-gray-400 text-sm pt-2">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleReactionClick(post.id)}
                        className="flex items-center space-x-1"
                      >
                        <Heart 
                          size={18} 
                          className={post.post_likes?.some((like: any) => 
                            like.user_id === currentUser?.id && like.reaction_type === 'like'
                          ) ? 'fill-red-500 text-red-500' : ''} 
                        />
                        <span>{post.post_likes?.length || 0}</span>
                      </button>
                      <Drawer>
                        <DrawerTrigger asChild>
                          <button className="flex items-center space-x-1">
                            <MessageSquare size={18} />
                            <span>{post.post_comments?.length || 0}</span>
                          </button>
                        </DrawerTrigger>
                        <DrawerContent className="bg-gray-900 text-white">
                          <div className="p-4 max-h-[80vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Comentários</h3>
                            <div className="space-y-4 mb-6">
                              {post.post_comments?.length > 0 ? (
                                post.post_comments.map((comment: any) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                      {comment.user?.avatar_url ? (
                                        <img
                                          src={comment.user.avatar_url}
                                          alt={comment.user?.username || "Usuário"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-purple-700 flex items-center justify-center">
                                          <span className="text-xs font-bold text-white">
                                            {comment.user?.username?.[0]?.toUpperCase() || "U"}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="bg-gray-800 p-3 rounded-lg">
                                        <p className="font-medium text-sm">{comment.user?.username}</p>
                                        <p className="text-gray-300">{comment.content}</p>
                                      </div>
                                      <span className="text-xs text-gray-500 mt-1 block">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-400">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                              )}
                            </div>
                            <div className="flex gap-2 sticky bottom-0 bg-gray-900 pt-2">
                              <Textarea
                                placeholder="Adicione um comentário..."
                                className="flex-1 bg-gray-800 border-gray-700"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                              />
                              <Button 
                                variant="secondary" 
                                className="bg-purple-700 hover:bg-purple-600"
                                onClick={() => handleComment(post.id)}
                              >
                                Enviar
                              </Button>
                            </div>
                          </div>
                        </DrawerContent>
                      </Drawer>
                      <button className="flex items-center space-x-1">
                        <Share2 size={18} />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                    <span className="text-xs">
                      {format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                  {showReactionMenu && selectedPostId === post.id && (
                    <div className="mt-2">
                      <ReactionMenu
                        onReactionSelect={(emoji) => {
                          handleLike(post.id, emoji);
                          setShowReactionMenu(false);
                        }}
                        onClose={() => setShowReactionMenu(false)}
                        options={emojiOptions}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">Nenhum post encontrado</p>
            <Button onClick={() => navigate("/novo-post")} variant="secondary" className="bg-purple-700 hover:bg-purple-600">
              Criar Novo Post
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
