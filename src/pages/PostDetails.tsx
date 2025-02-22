
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ReactionMenu from "@/components/ReactionMenu";

interface PostDetails {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  likes: number;
  reaction_type?: string;
  comments: {
    id: string;
    content: string;
    created_at: string;
    likes: number;
    has_liked: boolean;
    user: {
      id: string;
      username: string;
      full_name: string;
      avatar_url: string;
    };
  }[];
}

export default function PostDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<PostDetails | null>(null);
  const [comment, setComment] = useState("");
  const [activeReactionMenu, setActiveReactionMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
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
          )
        `)
        .eq('id', id)
        .single();

      if (postError) throw postError;

      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          comment_likes!left (
            user_id
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const formattedComments = commentsData.map(comment => ({
        ...comment,
        likes: comment.comment_likes?.length || 0,
        has_liked: comment.comment_likes?.some(like => like.user_id === currentUser?.id) || false
      }));

      setPost({
        ...postData,
        reaction_type: postData.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
        likes: postData.post_likes?.length || 0,
        comments: formattedComments
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar o post",
        variant: "destructive",
      });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para curtir",
          variant: "destructive",
        });
        return;
      }

      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }

      await fetchPost();
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir o comentário",
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', id)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', id)
            .eq('user_id', user.id);
        }
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: id,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      setActiveReactionMenu(false);
      await fetchPost();
      
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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
          user_id: user.id,
          content: comment.trim()
        });

      setComment("");
      setReplyingTo(null);
      await fetchPost();
      
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

  const handleReply = (username: string) => {
    setReplyingTo(username);
    setComment(`@${username} `);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {post.user.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg">{post.user.full_name}</h2>
                <p className="text-muted-foreground">@{post.user.username}</p>
              </div>
            </div>

            {/* Post Content */}
            {post.content && (
              <p className="text-lg mb-4 whitespace-pre-wrap">{post.content}</p>
            )}

            {/* Media */}
            {(post.images?.length > 0 || post.video_urls?.length > 0) && (
              <div className="mb-4 -mx-6">
                <MediaCarousel
                  images={post.images || []}
                  videoUrls={post.video_urls || []}
                  title={post.content || ""}
                  showControls={true}
                  cropMode="contain"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 py-4 border-y">
              <div className="relative">
                <button
                  className="flex items-center gap-2 transition-colors duration-200 hover:text-primary"
                  onClick={() => setActiveReactionMenu(!activeReactionMenu)}
                >
                  <span className="text-xl">
                    {post.reaction_type ? getReactionIcon(post.reaction_type) : '👍'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {post.likes || 0}
                  </span>
                </button>
                
                <ReactionMenu 
                  isOpen={activeReactionMenu}
                  onSelect={handleReaction}
                />
              </div>

              <button className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm text-muted-foreground">
                  {post.comments?.length || 0}
                </span>
              </button>

              <button
                className="flex items-center transition-colors duration-200 hover:text-primary"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder={replyingTo ? `Respondendo @${replyingTo}...` : "Adicione um comentário..."}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button onClick={handleComment}>Comentar</Button>
              </div>

              <div className="space-y-4">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {comment.user.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user.full_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                          })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`text-sm hover:text-primary transition-colors ${
                            comment.has_liked ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {comment.has_liked ? '❤️' : '🤍'} {comment.likes}
                        </button>
                        <button
                          onClick={() => handleReply(comment.user.username)}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
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
