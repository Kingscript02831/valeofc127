import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSession } from '@/contexts/SessionContext';
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Heart, MessageSquare, Share2, Send, Flag, Bookmark, HeartIcon, MessageSquareIcon, Share2Icon, SendIcon, FlagIcon, BookmarkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ReactionMenu from '@/components/ReactionMenu';
import { getReactionIcon } from '@/utils/emojisPosts';
import { cn, formatDate } from '@/lib/utils';

const PostDetails = () => {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | undefined>(undefined);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useSession();
  const userId = session?.user?.id;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPostDetails(id);
      fetchComments(id);
    }
  }, [id]);

  useEffect(() => {
    if (post) {
      setIsLiked(!!post.reaction_type);
      setLikeCount(post.likes);
    }
  }, [post]);

  const fetchPostDetails = async (postId: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
      toast({
        title: "Erro ao carregar detalhes do post.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erro ao carregar comentários.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!session?.user) {
      toast({
        title: "Você precisa estar logado para reagir.",
        description: "Faça login para continuar.",
      });
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/react`, {
        reaction_type: reactionType,
      }, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      setPost(prevPost => ({
        ...prevPost,
        likes: response.data.likes,
        reaction_type: response.data.reaction_type,
        reactionsByType: response.data.reactionsByType,
      }));
      setIsLiked(!!response.data.reaction_type);
      setLikeCount(response.data.likes);
      setCurrentReaction(reactionType);

      toast({
        title: "Reação enviada!",
        description: `Você reagiu com ${reactionType}.`,
      })
    } catch (error: any) {
      console.error('Error reacting to post:', error);
      toast({
        title: "Erro ao reagir ao post.",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsReactionMenuOpen(false);
    }
  };

  const toggleReactionMenu = () => {
    setIsReactionMenuOpen(!isReactionMenuOpen);
  };

  const handleCommentSubmit = async () => {
    if (!session?.user) {
      toast({
        title: "Você precisa estar logado para comentar.",
        description: "Faça login para continuar.",
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: "Comentário vazio.",
        description: "Por favor, escreva algo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/comments`,
        { text: commentText },
        {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        }
      );

      setComments([response.data, ...comments]);
      setCommentText('');
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado.",
      })
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao adicionar comentário.",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      }).then(() => {
        toast({
          title: "Link compartilhado!",
          description: "O link do post foi copiado.",
        })
      }).catch((error) => {
        console.error('Error sharing:', error);
        toast({
          title: "Erro ao compartilhar.",
          description: "Não foi possível compartilhar o link.",
          variant: "destructive",
        })
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast({
            title: "Link copiado!",
            description: "O link do post foi copiado para a área de transferência.",
          })
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          toast({
            title: "Erro ao copiar link.",
            description: "Não foi possível copiar o link para a área de transferência.",
            variant: "destructive",
          })
        });
    }
  };

  if (!post) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{post.user.name}</h2>
                  <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <FlagIcon className="mr-2 h-4 w-4" />
                    <span>Report</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    <span>Save</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Share</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="text-gray-700">{post.content}</p>
          </div>
          {post.media && (
            <img src={post.media} alt="Post Media" className="w-full rounded-md mb-4" />
          )}

          {post && post.likes > 0 && (
            <div 
              className="flex items-center gap-2 px-3 mt-3 mb-2 rounded-lg p-2 mx-3 cursor-pointer"
              onClick={() => post.likes > 0 && navigate(`/pagcurtidas/${post.id}`)}
            >
              <div className="flex -space-x-2 overflow-hidden">
                {post.reactionsByType && Object.keys(post.reactionsByType).map((type, index) => (
                  <img 
                    key={type} 
                    src={getReactionIcon(type)} 
                    alt={type}
                    className="inline-block h-6 w-6 rounded-full"
                    style={{ zIndex: 10 - index }}
                  />
                ))}
              </div>
              <span className="text-sm hover:underline">
                {post.reaction_type && post.likes > 1 ? (
                  <span>Você e outras {post.likes - 1} pessoas</span>
                ) : post.reaction_type ? (
                  <span>Você</span>
                ) : post.likes > 0 ? (
                  <span>{post.likes} pessoas</span>
                ) : null}
              </span>
            </div>
          )}

          <div className="flex justify-around items-center mt-4">
            <Button variant="outline" onClick={toggleReactionMenu}>
              {isLiked ? (
                <>
                  <img
                    src={getReactionIcon(post.reaction_type)}
                    alt="Reagido"
                    className="h-5 w-5 mr-2"
                  />
                  Desfazer
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Reagir
                </>
              )}
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-5 w-5" />
              Comentar
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-5 w-5" />
              Compartilhar
            </Button>
          </div>
          <ReactionMenu
            isOpen={isReactionMenuOpen}
            onSelect={handleReaction}
            currentReaction={currentReaction}
          />
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Comentários</h3>
            {comments.map((comment: any) => (
              <div key={comment.id} className="mb-4 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <Avatar>
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{comment.user.name}</div>
                    <div className="text-gray-700">{comment.text}</div>
                    <div className="text-gray-500 text-sm">{formatDate(comment.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={session?.user?.avatar} />
                <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <input
                type="text"
                placeholder="Adicionar um comentário..."
                className="w-full border p-2 rounded-md"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCommentSubmit();
                  }
                }}
              />
              <Button variant="outline" onClick={handleCommentSubmit}>
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetails;
