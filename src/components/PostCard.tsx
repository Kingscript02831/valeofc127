
import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

interface PostCardProps {
  post: {
    id: string;
    image_url: string;
    caption: string;
    created_at: string;
    user_id: string;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  // Fetch user profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', post.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.user_id)
        .maybeSingle();
      return data;
    }
  });

  // Fetch like count
  useQuery({
    queryKey: ['likes', post.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);
      setLikeCount(count || 0);
      return count;
    }
  });

  // Fetch comment count
  useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);
      setCommentCount(count || 0);
      return count;
    }
  });

  // Check if current user has liked the post
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: like } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', session.user.id)
          .maybeSingle();
        setIsLiked(!!like);
      }
      return session;
    }
  });

  const handleLike = async () => {
    if (!session?.user) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', session.user.id);
        setLikeCount(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: session.user.id
          });
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex items-center space-x-2">
        <Avatar>
          <AvatarImage
            src={profile?.avatar_url || "/placeholder.svg"}
            alt={profile?.name || "User"}
          />
        </Avatar>
        <div>
          <p className="font-semibold">{profile?.name || "Usuário"}</p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
      </div>
      
      <img
        src={post.image_url}
        alt="Post"
        className="w-full aspect-square object-cover"
      />
      
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex space-x-4 text-sm">
            <span>{likeCount} curtidas</span>
            <span>{commentCount} comentários</span>
          </div>
          
          {post.caption && (
            <p className="text-sm">
              <span className="font-semibold">{profile?.name || "Usuário"}</span>{" "}
              {post.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
