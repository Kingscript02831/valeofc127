
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Send, Trash2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

interface Story {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
  expires_at: string;
  user_id: string;
}

interface StoryUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

const StoryViewer = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch stories for the user
  const { data: storiesData, isLoading, error } = useQuery({
    queryKey: ["userStories", userId],
    queryFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        throw new Error("Not authenticated");
      }

      const { data: stories, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", userId)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (storiesError) throw storiesError;
      
      if (!stories || stories.length === 0) {
        return { stories: [], user: null };
      }

      // Get user information
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Mark story as viewed if it's not the user's own story
      if (userId !== currentUser.user.id) {
        const currentStory = stories[currentIndex];
        
        const { error: viewError } = await supabase
          .from("story_views")
          .upsert({
            story_id: currentStory.id,
            viewer_id: currentUser.user.id,
            viewed_at: new Date().toISOString()
          });

        if (viewError) console.error("Error marking story as viewed:", viewError);
      }

      return { stories, user: userData };
    },
    refetchOnWindowFocus: false,
  });

  // Fetch comments for the current story
  const fetchComments = async (storyId: string) => {
    const { data, error } = await supabase
      .from("story_comments")
      .select(`
        id,
        story_id,
        user_id,
        text,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    // Transform the data to match our StoryComment interface
    return data.map((comment) => ({
      ...comment,
      user: {
        username: comment.profiles.username,
        avatar_url: comment.profiles.avatar_url
      }
    }));
  };

  // Check if the current user has liked the story
  const checkIfLiked = async (storyId: string) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return false;

    const { data, error } = await supabase
      .from("story_likes")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", currentUser.user.id)
      .single();

    return !error && data !== null;
  };

  // Update comments and like status when story changes
  useEffect(() => {
    if (storiesData?.stories && storiesData.stories.length > 0) {
      const currentStory = storiesData.stories[currentIndex];
      
      fetchComments(currentStory.id).then(setComments);
      checkIfLiked(currentStory.id).then(setIsLiked);
    }
  }, [storiesData, currentIndex]);

  // Add a comment
  const addComment = useMutation({
    mutationFn: async (text: string) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      const currentStory = storiesData?.stories[currentIndex];
      if (!currentStory) throw new Error("No story found");

      const { data, error } = await supabase
        .from("story_comments")
        .insert({
          story_id: currentStory.id,
          user_id: currentUser.user.id,
          text
        })
        .select(`
          id,
          story_id,
          user_id,
          text,
          created_at,
          profiles:user_id (
            username,
            avatar_url
          )
        `);

      if (error) throw error;
      
      return {
        ...data[0],
        user: {
          username: data[0].profiles.username,
          avatar_url: data[0].profiles.avatar_url
        }
      };
    },
    onSuccess: (newComment) => {
      setComments(prev => [...prev, newComment]);
      setCommentText("");
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  // Delete a comment
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("story_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return commentId;
    },
    onSuccess: (commentId) => {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  });

  // Like / unlike a story
  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      const currentStory = storiesData?.stories[currentIndex];
      if (!currentStory) throw new Error("No story found");

      if (isLiked) {
        // Unlike story
        const { error } = await supabase
          .from("story_likes")
          .delete()
          .eq("story_id", currentStory.id)
          .eq("user_id", currentUser.user.id);

        if (error) throw error;
        return false;
      } else {
        // Like story
        const { error } = await supabase
          .from("story_likes")
          .insert({
            story_id: currentStory.id,
            user_id: currentUser.user.id
          });

        if (error) throw error;
        return true;
      }
    },
    onSuccess: (liked) => {
      setIsLiked(liked);
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
    }
  });

  useEffect(() => {
    if (storiesData?.stories && storiesData.stories.length > 0) {
      startProgressTimer();
      
      // Reset progress when story changes
      setProgress(0);
      
      // Check if current story is liked
      const currentStory = storiesData.stories[currentIndex];
      checkIfLiked(currentStory.id).then(setIsLiked);
      
      // Fetch comments
      fetchComments(currentStory.id).then(setComments);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, storiesData]);

  const startProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const duration = 5000; // 5 seconds per story
    const interval = 100; // Update every 100ms
    const increment = (interval / duration) * 100;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goToNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, interval);
  };

  const pauseProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsPaused(true);
    
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const resumeProgress = () => {
    if (!progressIntervalRef.current) {
      startProgressTimer();
    }
    setIsPaused(false);
    
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const goToPreviousStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Go back to home page if at first story
      navigate("/");
    }
  };

  const goToNextStory = () => {
    if (storiesData?.stories && currentIndex < storiesData.stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Go back to home page if at last story
      navigate("/");
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment.mutate(commentText.trim());
    }
  };

  const handleLike = () => {
    toggleLike.mutate();
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment.mutate(commentId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-pulse text-white text-xl">Loading stories...</div>
      </div>
    );
  }

  // Show error
  if (error || !storiesData || !storiesData.stories || storiesData.stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-white text-xl mb-4">No stories found</div>
        <Button onClick={() => navigate("/")} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const currentStory = storiesData.stories[currentIndex];
  const user = storiesData.user as StoryUser;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Story header */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white mr-2" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft />
        </Button>
        
        <Avatar className="h-10 w-10 mr-3">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.username} />
          ) : (
            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="text-white font-semibold">{user.username}</div>
          <div className="text-gray-300 text-xs">
            {new Date(currentStory.created_at).toLocaleString()}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={() => navigate("/")}
        >
          <X />
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="relative z-10 px-3 flex space-x-1">
        {storiesData.stories.map((_, i) => (
          <div key={i} className="h-0.5 bg-gray-500 flex-1">
            <div 
              className="h-full bg-white"
              style={{ 
                width: `${i < currentIndex ? 100 : i === currentIndex ? progress : 0}%`,
                transition: "width 0.1s linear"
              }}
            ></div>
          </div>
        ))}
      </div>
      
      {/* Story content */}
      <div 
        className="relative flex-1 flex items-center justify-center"
        onTouchStart={() => pauseProgress()}
        onTouchEnd={() => resumeProgress()}
        onMouseDown={() => pauseProgress()}
        onMouseUp={() => resumeProgress()}
      >
        {/* Previous story button */}
        <div 
          className="absolute left-0 top-0 h-full w-1/4 z-10"
          onClick={goToPreviousStory}
        ></div>
        
        {/* Next story button */}
        <div 
          className="absolute right-0 top-0 h-full w-1/4 z-10"
          onClick={goToNextStory}
        ></div>
        
        {/* Media content */}
        <div className="relative w-full h-full flex items-center justify-center">
          {currentStory.media_type === "image" ? (
            <img 
              src={currentStory.media_url} 
              alt="Story" 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video 
              ref={videoRef}
              src={currentStory.media_url} 
              className="max-w-full max-h-full object-contain"
              autoPlay 
              loop 
              muted 
            />
          )}
        </div>
        
        {/* Like animation */}
        {isLiked && (
          <div className="absolute bottom-40 right-4 animate-fade-up">
            <img src="/amei1.png" alt="Liked" className="w-12 h-12" />
          </div>
        )}
      </div>
      
      {/* Bottom action bar */}
      <div className="relative z-10 px-4 py-3 bg-black bg-opacity-50 flex flex-col">
        {/* Comments list */}
        <div className="max-h-32 overflow-y-auto mb-2 space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start text-white">
              <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
                {comment.user.avatar_url ? (
                  <AvatarImage src={comment.user.avatar_url} alt={comment.user.username} />
                ) : (
                  <AvatarFallback>{comment.user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <span className="font-semibold mr-2">{comment.user.username}</span>
                <span>{comment.text}</span>
              </div>
              {/* Delete button for user's own comments */}
              {comment.user_id === supabase.auth.getUser().then(({ data }) => data.user?.id) && (
                <button 
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Action bar */}
        <div className="flex items-center">
          <button
            onClick={handleLike}
            className="mr-4"
          >
            <img 
              src={isLiked ? "/amei1.png" : "/curtidas.png"} 
              alt="Like" 
              className="w-7 h-7"
            />
          </button>
          
          <form onSubmit={handleCommentSubmit} className="flex-1 flex">
            <Input
              ref={commentInputRef}
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="bg-gray-800 text-white border-gray-700 flex-1"
              onClick={() => pauseProgress()}
              onBlur={() => !commentText && resumeProgress()}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="ml-2 text-white"
              disabled={!commentText.trim()}
            >
              <Send size={20} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
