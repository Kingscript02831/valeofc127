
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StoriesRow from "@/components/StoriesRow";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { PostType } from "@/types/posts";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
          user_id,
          location,
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
        // Temporary solution until likes table is created
        const formattedPosts = data.map(post => ({
          ...post,
          created_at: post.created_at,
          likes: [], // Empty array as placeholder
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

    toast.success('Funcionalidade de likes será implementada em breve!');
    // We'll implement the actual like functionality once the likes table is created
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
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 flex-grow">
          <StoriesRow />
          <div className="text-center mt-8">Carregando posts...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 flex-grow">
          <StoriesRow />
          <div className="text-center text-red-500 mt-8">Erro: {error}</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-12 lg:px-20 py-6 flex-grow">
        <StoriesRow />

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6 text-center mt-6">
            <p className="text-gray-700 dark:text-gray-300">Nenhum post encontrado. Seja o primeiro a compartilhar!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 mt-4">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.avatar_url}
                    alt={post.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold dark:text-white">{post.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <button onClick={(event) => handleMenuClick(event, post)}>
                  <MoreHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
                {post.location && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {post.location}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex border-t dark:border-gray-700 p-2">
                <button 
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors px-3 py-1.5 rounded-lg"
                  onClick={() => handlePostLike(post.id)}
                >
                  <span>Like</span> 
                  <span className="text-xs">{post.likes.length}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors px-3 py-1.5 rounded-lg">
                  <span>Comentar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Posts;
