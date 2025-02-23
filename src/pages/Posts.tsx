
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaCarousel } from "@/components/MediaCarousel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Share2, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ReactionMenu from '@/components/ReactionMenu';

const Posts: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [reactionMenuStates, setReactionMenuStates] = useState<{ [key: string]: boolean }>({});

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', searchTerm],
    queryFn: async () => {
      try {
        let query = supabase
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
              id
            )
          `)
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.ilike('content', `%${searchTerm}%`);
        }

        const { data: postsData, error } = await query;
        if (error) throw error;

        return postsData.map(post => ({
          ...post,
          reaction_type: post.post_likes?.find(like => like.user_id === currentUser?.id)?.reaction_type,
          likes: post.post_likes?.length || 0,
          comment_count: post.post_comments?.length || 0
        }));
      } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
    },
  });

  const toggleReactionMenu = (postId: string) => {
    setReactionMenuStates(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleReaction = async (postId: string, reactionType: string) => {
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
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);
        } else {
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);
        }
      } else {
        await supabase.from('post_likes').insert({
          post_id: postId,
          user_id: currentUser.id,
          reaction_type: reactionType
        });
      }

      setReactionMenuStates(prev => ({
        ...prev,
        [postId]: false
      }));
    } catch (error) {
      console.error('Error in reaction handler:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {posts?.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {post.user.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{post.user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>

                <div 
                  className="mt-3 cursor-pointer"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  {post.content && (
                    <p className="text-lg whitespace-pre-wrap">{post.content}</p>
                  )}

                  {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                    <div className="mt-3">
                      <MediaCarousel
                        images={post.images || []}
                        videoUrls={post.video_urls || []}
                        title={post.content || ""}
                        showControls={true}
                        cropMode="contain"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReactionMenu(post.id);
                      }}
                    >
                      {post.reaction_type ? (
                        <span className="text-xl">{getReactionIcon(post.reaction_type)}</span>
                      ) : (
                        <span className="text-xl">👍</span>
                      )}
                      <span>{post.likes}</span>
                    </Button>
                    <ReactionMenu
                      isOpen={reactionMenuStates[post.id] || false}
                      onSelect={(type) => handleReaction(post.id, type)}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/posts/${post.id}`)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comment_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.share({ url: window.location.href });
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Compartilhar</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

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

export default Posts;
