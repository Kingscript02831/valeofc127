import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StoriesBar from '../components/StoriesBar';
import MediaCarousel from '../components/MediaCarousel';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { Share, MoreHorizontal, MapPin } from 'lucide-react';
import ReactionMenu from '../components/ReactionMenu';
import BottomNav from '../components/BottomNav';
import { supabase } from '../integrations/supabase/client';
import { Avatar } from '../components/ui/avatar';
import EMOJIS from '../utils/emojisPosts';
import Tags from '../components/Tags';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Locpost from '../components/locpost';

interface Post {
  id: string;
  created_at: string;
  media_urls: string[];
  user_id: string;
  likes: number;
  comments: number;
  location: string | null;
  author?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  reactions?: {
    [key: string]: number;
  };
  tags?: string[];
}

const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, 
      created_at, 
      media_urls, 
      user_id, 
      likes, 
      comments,
      location,
      author:profiles (id, username, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }

  return data?.map(post => ({
    ...post,
    media_urls: post.media_urls ? JSON.parse(post.media_urls as string) : [],
    tags: ['travel', 'nature', 'photography']
  })) || [];
};

const Posts = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<{ [postId: string]: { [emoji: string]: number } }>({});
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  const {
    data: posts,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  const timeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'há muito tempo';
    }
  };

  const toggleReactionMenu = (postId: string) => {
    setSelectedPostId(postId);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEmojiSelection = async (emoji: string) => {
    if (!selectedPostId) return;

    setSelectedEmoji(emoji);
    setIsMenuOpen(false);

    try {
      const userId = supabase.auth.user()?.id;
      if (!userId) {
        console.error("User not authenticated.");
        return;
      }

      const { data: existingReaction, error: reactionError } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', selectedPostId)
        .eq('user_id', userId)
        .single();

      if (reactionError && reactionError.code !== 'PGRST116') {
        console.error("Error checking existing reaction:", reactionError);
        return;
      }

      if (existingReaction) {
        if (existingReaction.reaction_type === emoji) {
          // Remove reaction
          const { error: deleteError } = await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existingReaction.id);

          if (deleteError) {
            console.error("Error deleting reaction:", deleteError);
            return;
          }

          setReactionCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            if (newCounts[selectedPostId]) {
              newCounts[selectedPostId][emoji] = (newCounts[selectedPostId][emoji] || 0) - 1;
              if (newCounts[selectedPostId][emoji] === 0) {
                delete newCounts[selectedPostId][emoji];
              }
            }
            return newCounts;
          });
        } else {
          // Update reaction
          const { error: updateError } = await supabase
            .from('post_reactions')
            .update({ reaction_type: emoji })
            .eq('id', existingReaction.id);

          if (updateError) {
            console.error("Error updating reaction:", updateError);
            return;
          }

          setReactionCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            if (newCounts[selectedPostId]) {
              newCounts[selectedPostId][existingReaction.reaction_type] = (newCounts[selectedPostId][existingReaction.reaction_type] || 0) - 1;
              newCounts[selectedPostId][emoji] = (newCounts[selectedPostId][emoji] || 0) + 1;
              if (newCounts[selectedPostId][existingReaction.reaction_type] === 0) {
                delete newCounts[selectedPostId][existingReaction.reaction_type];
              }
            }
            return newCounts;
          });
        }
      } else {
        // Add reaction
        const { error: insertError } = await supabase
          .from('post_reactions')
          .insert([{ post_id: selectedPostId, user_id: userId, reaction_type: emoji }]);

        if (insertError) {
          console.error("Error adding reaction:", insertError);
          return;
        }

        setReactionCounts(prevCounts => {
          const newCounts = { ...prevCounts };
          if (!newCounts[selectedPostId]) {
            newCounts[selectedPostId] = {};
          }
          newCounts[selectedPostId][emoji] = (newCounts[selectedPostId][emoji] || 0) + 1;
          return newCounts;
        });
      }
    } catch (err) {
      console.error("Unexpected error reacting to post:", err);
    }
  };

  const getReactions = useCallback(async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction_type, count(*)')
        .eq('post_id', postId)
        .group('reaction_type');

      if (error) {
        console.error("Error fetching reactions:", error);
        return {};
      }

      const counts: { [emoji: string]: number } = {};
      data.forEach(item => {
        counts[item.reaction_type] = item.count;
      });

      return counts;
    } catch (err) {
      console.error("Unexpected error fetching reactions:", err);
      return {};
    }
  }, []);

  useEffect(() => {
    const fetchAllReactions = async () => {
      if (!posts) return;

      const initialCounts: { [postId: string]: { [emoji: string]: number } } = {};
      for (const post of posts) {
        initialCounts[post.id] = await getReactions(post.id);
      }
      setReactionCounts(initialCounts);
    };

    fetchAllReactions();
  }, [posts, getReactions]);

  const navigateToPostDetails = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="bg-white dark:bg-background min-h-screen pb-16">
      <Navbar />
      <StoriesBar />
      <div className="container max-w-3xl mx-auto px-0 sm:px-4 pt-2">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="h-px bg-gray-200 dark:bg-gray-800 w-full my-2"></div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded col-span-2"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded col-span-3"></div>
                    </div>
                  </div>
                  <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="flex justify-between mt-3">
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-red-500">Error: {error.message}</div>
          ) : (
            posts?.map((post) => (
              <div key={post.id} className="bg-card dark:bg-gray-800 rounded-lg shadow-md post-card">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <img
                        src={post.author?.avatar_url || "https://avatar.vercel.sh"}
                        alt="User Avatar"
                        className="rounded-full object-cover"
                      />
                    </Avatar>
                    <div>
                      <div className="font-semibold">{post.author?.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {timeAgo(post.created_at)}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-500 dark:text-gray-400">
                    <MoreHorizontal />
                  </button>
                </div>

                {post.media_urls && post.media_urls.length > 0 && (
                  <MediaCarousel mediaUrls={post.media_urls} />
                )}

                <div className="p-4">
                  {post.location && (
                    <Locpost location={post.location} />
                  )}
                  <Tags tags={post.tags || []} />
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex space-x-4">
                      <button
                        className="reaction-button"
                        onClick={() => toggleReactionMenu(post.id)}
                      >
                        {selectedPostId === post.id && isMenuOpen ? (
                          <span className="reaction-emoji"></span>
                        ) : (
                          <span className="reaction-emoji">
                            {EMOJIS[0]}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => navigateToPostDetails(post.id)}
                        className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary"
                      >
                        <span>Comment</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary">
                        <Share className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Link
                      to={`/post/${post.id}`}
                      className="reaction-count"
                    >
                      View all {post.comments} comments
                    </Link>
                  </div>
                  {reactionCounts[post.id] && Object.keys(reactionCounts[post.id]).length > 0 && (
                    <div className="reaction-counter">
                      <div className="reaction-counter-icons">
                        {Object.entries(reactionCounts[post.id])
                          .sort(([, countA], [, countB]) => countB - countA)
                          .slice(0, 3)
                          .map(([emoji], index) => (
                            <span key={index} className="reaction-counter-icon">
                              {emoji}
                            </span>
                          ))}
                      </div>
                      <span className="reaction-counter-text">
                        {Object.values(reactionCounts[post.id]).reduce((sum, count) => sum + count, 0)} reactions
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Posts;
