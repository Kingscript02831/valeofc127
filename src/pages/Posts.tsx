import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StoriesRow from "@/components/StoriesRow";
import MediaCarousel from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import Navbar2 from "@/components/Navbar2";
import SubNav2 from "@/components/SubNav2";
import ReactionMenu from "@/components/ReactionMenu";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import PostsMenu from "@/components/PostsMenu";
import { useNavigate } from "react-router-dom";
import { emojis } from "@/utils/emojisPosts";
import Tags from "@/components/Tags";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/use-mobile";
import Locpost from "@/components/locpost";
import { PostType } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal } from "lucide-react";

const Index: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(768);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          created_at,
          content,
          media_url,
          user_id,
          location,
          likes (user_id),
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts.");
        toast.error("Failed to load posts.");
      }

      if (data) {
        const formattedPosts = data.map(post => ({
          ...post,
          created_at: post.created_at,
          likes: post.likes ? post.likes.length : 0,
          liked_by_user: post.likes ? post.likes.some(like => like.user_id === post.user_id) : false,
          username: post.profiles?.username || 'Unknown User',
          avatar_url: post.profiles?.avatar_url || '/placeholder.svg',
        }));
        setPosts(formattedPosts as PostType[]);
      }
    } catch (err) {
      console.error("Unexpected error fetching posts:", err);
      setError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostLike = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Você precisa estar logado para curtir o post');
      return;
    }

    const post = posts.find(post => post.id === postId);

    if (!post) {
      toast.error('Post não encontrado');
      return;
    }

    const alreadyLiked = post.likes.some(like => like.user_id === user.id);

    if (alreadyLiked) {
      // Unlike the post
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error unliking post:", error);
        toast.error("Error unliking post.");
        return;
      }

      // Optimistically update the UI
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? { ...p, likes: p.likes.filter(like => like.user_id !== user.id) }
            : p
        )
      );
      queryClient.invalidateQueries(['posts']);
      toast.success('Post descurtido!');
    } else {
      // Like the post
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: user.id }]);

      if (error) {
        console.error("Error liking post:", error);
        toast.error("Error liking post.");
        return;
      }

      // Optimistically update the UI
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? { ...p, likes: [...p.likes, { user_id: user.id }] }
            : p
        )
      );
      queryClient.invalidateQueries(['posts']);
      toast.success('Post curtido!');
    }
  };

  const handleMenuClick = (event: React.MouseEvent, post: PostType) => {
    event.preventDefault();
    setSelectedPost(post);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  if (loading) {
    return <div className="text-center">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Navbar2 />
      <SubNav2 />

      <div className="container mx-auto px-4 md:px-12 lg:px-20 py-6 flex-grow">
        <StoriesRow />

        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <img
                  src={post.avatar_url}
                  alt={post.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{post.username}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
              <button onClick={(event) => handleMenuClick(event, post)}>
                <MoreHorizontal className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {post.media_url && (
              <MediaCarousel mediaUrls={[post.media_url]} />
            )}

            <div className="p-4">
              <p className="text-gray-700 leading-relaxed">{post.content}</p>
              {post.location && (
                <Locpost location={post.location} />
              )}
              <Tags />
            </div>

            <ReactionMenu
              postId={post.id}
              likes={post.likes.length}
              likedByUser={post.likes.some(like => like.user_id === post.user_id)}
              onLike={() => handlePostLike(post.id)}
            />
          </div>
        ))}
      </div>

      <BottomNav />

      {selectedPost && (
        <PostsMenu
          isOpen={isMenuOpen}
          onClose={handleCloseMenu}
          x={menuPosition.x}
          y={menuPosition.y}
          postId={selectedPost.id}
        />
      )}
    </div>
  );
};

export default Index;
