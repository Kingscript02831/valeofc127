
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, Share2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ReactionMenu from "@/components/ReactionMenu";
import { useQuery } from "@tanstack/react-query";
import { getReactionIcon } from "@/utils/emojisPosts";
import Tags from "@/components/Tags";
import LocationDisplay from "@/components/locpost";
import { useState } from "react";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReactionMenu, setShowReactionMenu] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");
      
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          post_reactions (
            reaction_type,
            user_id
          ),
          post_comments (
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-20 pb-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded-lg w-1/3"></div>
              <div className="h-60 bg-muted rounded-lg"></div>
              <div className="h-4 bg-muted rounded-lg"></div>
              <div className="h-4 bg-muted rounded-lg w-2/3"></div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-20 pb-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold">Post não encontrado</h1>
            <p className="text-muted-foreground mt-2">
              O post que você está procurando não existe ou foi removido.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="mt-4"
            >
              Voltar para a página inicial
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user?.avatar_url} />
                  <AvatarFallback>
                    {post.user?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{post.user?.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    @{post.user?.username}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">
                  {post.created_at && 
                    format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
                <div className="text-lg whitespace-pre-wrap mb-4">
                  <Tags content={post.content} />
                </div>
                
                {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                  <div className="my-4">
                    <MediaCarousel
                      images={post.images || []}
                      videoUrls={post.video_urls || []}
                      title={post.content}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={() => setShowReactionMenu(!showReactionMenu)}>
                  {getReactionIcon(post.reaction_type) || "👍"} 
                  {post.post_reactions?.length || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.post_comments?.length || 0} Comentários
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
              
              {showReactionMenu && (
                <ReactionMenu
                  postId={post.id}
                  onClose={() => setShowReactionMenu(false)}
                  onReact={() => {}}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PostDetails;
