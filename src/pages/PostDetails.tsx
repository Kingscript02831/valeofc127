
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { MediaCarousel } from "@/components/MediaCarousel";
import ReactionMenu from "@/components/ReactionMenu";

export default function PostDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [activeReactionMenu, setActiveReactionMenu] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: post, refetch: refetchPost } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            id,
            username,
            full_name,
            avatar_url
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
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (postError) throw postError;

      return {
        ...postData,
        reaction_type: postData.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
        likes: postData.post_likes?.length || 0,
        comments: postData.post_comments || []
      };
    },
  });

  const handleComment = async () => {
    try {
      if (!currentUser) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para comentar",
          variant: "destructive",
        });
        return;
      }

      if (!comment.trim()) {
        toast({
          title: "Erro",
          description: "O comentário não pode estar vazio",
          variant: "destructive",
        });
        return;
      }

      await supabase
        .from('post_comments')
        .insert({
          post_id: id,
          user_id: currentUser.id,
          content: comment.trim()
        });

      setComment("");
      refetchPost();
      
      toast({
        title: "Sucesso",
        description: "Comentário adicionado",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (reactionType: string) => {
    try {
      if (!currentUser) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para reagir",
          variant: "destructive",
        });
        return;
      }

      const { data: existingReaction } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', id)
            .eq('user_id', currentUser.id);
        } else {
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', id)
            .eq('user_id', currentUser.id);
        }
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: id,
            user_id: currentUser.id,
            reaction_type: reactionType
          });
      }

      setActiveReactionMenu(false);
      refetchPost();
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para sua área de transferência",
      });
    }
  };

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                {post.user.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{post.user.full_name}</h2>
              <p className="text-lg text-muted-foreground">@{post.user.username}</p>
            </div>
          </div>

          {post.content && (
            <p className="text-xl leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {(post.images?.length > 0 || post.video_urls?.length > 0) && (
            <div className="w-full">
              <MediaCarousel
                images={post.images || []}
                videoUrls={post.video_urls || []}
                title={post.content || ""}
                showControls={true}
                cropMode="contain"
              />
            </div>
          )}

          <div className="flex items-center gap-6 py-6 border-y border-border/40">
            <div className="relative">
              <button
                onClick={() => setActiveReactionMenu(!activeReactionMenu)}
                className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
              >
                {post.reaction_type ? (
                  <span className="text-2xl">{getReactionIcon(post.reaction_type)}</span>
                ) : (
                  <span className="text-2xl">👍</span>
                )}
                <span>{post.likes}</span>
              </button>
              <ReactionMenu 
                isOpen={activeReactionMenu}
                onSelect={handleReaction}
              />
            </div>

            <button className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-6 w-6" />
              <span>{post.comments?.length || 0}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
            >
              <Share2 className="h-6 w-6" />
              <span>Compartilhar</span>
            </button>
          </div>

          <div className="space-y-6">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={comment.user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {comment.user.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {comment.user.full_name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-lg mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Barra inferior fixa para adicionar comentários */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 p-4">
        <div className="container max-w-4xl mx-auto flex gap-2">
          <Input
            placeholder="Adicione um comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-lg"
          />
          <Button onClick={handleComment} size="lg">
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}

const getReactionIcon = (type: string) => {
  switch (type) {
    case 'love':
      return '❤️';
    case 'haha':
      return '😂';
    case 'sad':
      return '😞';
    case 'angry':
      return '🤬';
    default:
      return '👍';
  }
};
