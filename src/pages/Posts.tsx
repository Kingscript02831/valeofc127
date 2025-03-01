import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MediaCarousel from '../components/MediaCarousel';
import Navbar from '../components/Navbar';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '../components/BottomNav';
import { MoreVertical, Heart, MessageCircle, Share2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from '../components/ui/avatar';
import Tags from '../components/Tags';
import { Menu } from '@radix-ui/react-dropdown-menu';
import ReactionMenu from '../components/ReactionMenu';
import { getReactionIcon, reactionsList } from '../utils/emojisPosts';
import Locpost from '../components/locpost';

interface Post {
  id: string;
  created_at: string;
  user_id: string;
  media: string[];
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  location: string | null;
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  reactions: {
    [key: string]: number;
  };
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<{ [postId: string]: string | null }>({});
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, created_at, user_id, media, content, likes, comments, tags, location,
            user:user_id ( id, username, avatar_url ),
            reactions
          `)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error);
        } else {
          setPosts(data || []);
          // Initialize user reactions based on fetched data
          const initialUserReactions: { [postId: string]: string | null } = {};
          data?.forEach(post => {
            initialUserReactions[post.id] = post.reactions?.currentUserReaction || null;
          });
          setUserReactions(initialUserReactions);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const togglePostExpansion = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleReactionSelect = async (type: string) => {
    if (!selectedPostId) return;

    // Optimistically update the UI
    setUserReactions(prevReactions => ({
      ...prevReactions,
      [selectedPostId]: type,
    }));

    // Close the reaction menu
    setIsReactionMenuOpen(false);

    // Make the API call to update the reaction
    const { error } = await supabase
      .rpc('react_to_post', {
        post_id: selectedPostId,
        reaction_type: type,
      });

    if (error) {
      toast.error('Failed to update reaction.');
      // Revert the UI update on error
      setUserReactions(prevReactions => ({
        ...prevReactions,
        [selectedPostId]: null,
      }));
    } else {
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries(['posts']);
      toast.success('Reaction updated successfully!');
    }
  };

  const openReactionMenu = (postId: string) => {
    setSelectedPostId(postId);
    setIsReactionMenuOpen(true);
  };

  const closeReactionMenu = () => {
    setIsReactionMenuOpen(false);
  };

  const navigateToPostDetails = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-background antialiased">
      <Navbar />
      <div className="container py-8">
        {posts.map((post) => (
          <div key={post.id} className="post-card bg-card rounded-lg shadow-md overflow-hidden mb-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="post-profile flex items-center gap-2">
                <Avatar>
                  <img src={post.user?.avatar_url} alt={post.user?.username} className="rounded-full" />
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold">{post.user?.username}</span>
                  <time className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</time>
                </div>
              </div>
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={toggleDropdown}
                  className="p-2 rounded-full hover:bg-secondary focus:outline-none"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-10">
                    <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50">Denunciar</a>
                    <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50">Salvar</a>
                  </div>
                )}
              </div>
            </div>

            {post.media && post.media.length > 0 && (
              <MediaCarousel media={post.media} />
            )}

            <div className="p-4">
              <p className="text-sm break-words">
                {expandedPostId === post.id ? post.content : `${post.content.substring(0, 100)}...`}
                {post.content.length > 100 && (
                  <button
                    onClick={() => togglePostExpansion(post.id)}
                    className="text-primary font-medium focus:outline-none"
                  >
                    {expandedPostId === post.id ? ' Ver menos' : ' Ver mais'}
                  </button>
                )}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-2">
                  <Tags tags={post.tags} />
                </div>
              )}
              {post.location && (
                <Locpost location={post.location} />
              )}
            </div>

            <div className="flex justify-around p-4 border-t border-border">
              <button
                onClick={() => openReactionMenu(post.id)}
                className="post-action hover:bg-secondary/50 rounded-xl"
              >
                <img
                  src={userReactions[post.id] ? getReactionIcon(userReactions[post.id]!) : "/curtidas.png"}
                  alt="Like"
                  className="w-5 h-5 mr-2"
                />
                Curtir
              </button>
              <button
                onClick={() => navigateToPostDetails(post.id)}
                className="post-action hover:bg-secondary/50 rounded-xl"
              >
                <img src="/comentario.png" alt="Comment" className="w-5 h-5 mr-2" />
                Comentar
              </button>
              <button className="post-action hover:bg-secondary/50 rounded-xl">
                <img src="/compartilharlink.png" alt="Share" className="w-5 h-5 mr-2" />
                Compartilhar
              </button>
              <button className="post-action hover:bg-secondary/50 rounded-xl">
                <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
                WhatsApp
              </button>
            </div>
            {selectedPostId === post.id && (
              <ReactionMenu
                isOpen={isReactionMenuOpen}
                onSelect={handleReactionSelect}
                currentReaction={userReactions[post.id] || null}
              />
            )}
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default Posts;
