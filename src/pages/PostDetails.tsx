import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Share,
  MoreVertical,
  Send,
  ThumbsUp,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ReactionMenu from "@/components/ReactionMenu";
import Footer from "@/components/Footer";
import MediaCarousel from "@/components/MediaCarousel";
import { emojiMap } from "@/utils/emojisPosts";
import Tags from "@/components/Tags";
import InstagramPost from "@/components/locpost";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(`*, 
            profiles(
              id, 
              username, 
              avatar_url,
              verified
            )
          `)
          .eq("id", id)
          .single();

        if (postError) {
          console.error("Error fetching post:", postError);
          setError("Failed to load post.");
          return;
        }

        if (postData) {
          setPost(postData);
          setLikeCount(postData.likes || 0);
          setLocation(postData.location);
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(`*, 
            profiles(
              id, 
              username, 
              avatar_url,
              verified
            )
          `)
          .eq("post_id", id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching comments:", error);
          toast.error("Failed to load comments.");
          return;
        }

        setComments(data || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
        toast.error("Failed to load comments.");
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const checkLike = async () => {
      if (!user || !post) return;

      try {
        const { data, error } = await supabase
          .from("post_likes")
          .select("*")
          .eq("user_id", user.id)
          .eq("post_id", post.id);

        if (error) {
          console.error("Error checking like:", error);
          return;
        }

        setIsLiked(data && data.length > 0);
      } catch (err) {
        console.error("Error checking like:", err);
      }
    };

    checkLike();
  }, [user, post]);

  useEffect(() => {
    const fetchReactions = async () => {
      if (!post) return;

      try {
        const { data, error } = await supabase
          .from("post_reactions")
          .select("reaction, count")
          .eq("post_id", post.id);

        if (error) {
          console.error("Error fetching reactions:", error);
          return;
        }

        const reactionCounts = {};
        data.forEach((item) => {
          reactionCounts[item.reaction] = item.count;
        });
        setReactionCounts(reactionCounts);
      } catch (err) {
        console.error("Error fetching reactions:", err);
      }
    };

    fetchReactions();
  }, [post]);

  const handleLike = async () => {
    if (!user || !post) {
      toast.error("Você precisa estar logado para curtir.");
      return;
    }

    try {
      if (isLiked) {
        // Unlike post
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", post.id);

        if (error) {
          console.error("Error unliking post:", error);
          toast.error("Não foi possível descurtir o post.");
          return;
        }

        setIsLiked(false);
        setLikeCount((prevCount) => prevCount > 0 ? prevCount - 1 : 0);
      } else {
        // Like post
        const { error } = await supabase
          .from("post_likes")
          .insert([{ user_id: user.id, post_id: post.id }]);

        if (error) {
          console.error("Error liking post:", error);
          toast.error("Não foi possível curtir o post.");
          return;
        }

        setIsLiked(true);
        setLikeCount((prevCount) => prevCount + 1);
      }
    } catch (err) {
      console.error("Error liking post:", err);
      toast.error("Não foi possível curtir/descurtir o post.");
    }
  };

  const handleReaction = async (reaction) => {
    if (!user || !post) {
      toast.error("Você precisa estar logado para reagir.");
      return;
    }

    setSelectedReaction(reaction);

    try {
      const { error } = await supabase.rpc("add_post_reaction", {
        post_id: post.id,
        user_id: user.id,
        reaction: reaction,
      });

      if (error) {
        console.error("Error adding reaction:", error);
        toast.error("Não foi possível reagir ao post.");
        return;
      }

      setReactionCounts((prevCounts) => ({
        ...prevCounts,
        [reaction]: (prevCounts[reaction] || 0) + 1,
      }));
    } catch (err) {
      console.error("Error adding reaction:", err);
      toast.error("Não foi possível reagir ao post.");
    } finally {
      setShowReactionMenu(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para comentar.");
      return;
    }

    if (!newComment.trim()) {
      toast.error("O comentário não pode estar vazio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const commentContent = replyingTo
        ? `@${replyingTo.username} ${newComment}`
        : newComment;

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: id,
            user_id: user.id,
            content: commentContent,
            reply_to: replyingTo ? replyingTo.id : null,
          },
        ])
        .select(`*, 
          profiles(
            id, 
            username, 
            avatar_url,
            verified
          )
        `)
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        toast.error("Não foi possível adicionar o comentário.");
        return;
      }

      setComments((prevComments) => [data, ...prevComments]);
      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Não foi possível adicionar o comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyComment = (comment) => {
    setReplyingTo({ id: comment.id, username: comment.profiles?.username });
  };

  const renderComment = (comment) => {
    // Function to highlight mentions
    const highlightMentions = (text) => {
      // If text contains mentions (@username), highlight them
      if (!text) return "";
      
      // Split by @ symbol and process each part
      const parts = text.split(/@([a-zA-Z0-9_]+)/g);
      
      return parts.map((part, index) => {
        // Every odd index will be a username (after @ symbol)
        if (index % 2 === 1) {
          return <span key={index} className="mention">@{part}</span>;
        }
        return part;
      });
    };
    
    return (
      <div key={comment.id} className="border-b pb-3 mb-3">
        <div className="flex items-start gap-2">
          <Avatar className="w-8 h-8">
            <img 
              src={comment.profiles?.avatar_url || "/placeholder.svg"} 
              alt={comment.profiles?.username || "user"} 
              className="object-cover"
            />
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">
                {comment.profiles?.username || "Usuário"}
              </span>
              {comment.profiles?.verified && (
                <img src="/verificado.png" className="w-4 h-4" alt="Verificado" />
              )}
            </div>
            <p className="text-sm mt-1 mb-1">{highlightMentions(comment.content)}</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>{formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}</span>
              <button 
                onClick={() => handleReplyComment(comment)}
                className="hover:text-primary transition-colors"
              >
                Responder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full py-4 px-4">
        {/* Post Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="hover:opacity-75 transition-opacity">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold">Detalhes do Post</h1>
        </div>

        {loading ? (
          <p className="text-center py-4">Carregando post...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">{error}</p>
        ) : post ? (
          <>
            {/* Post Content */}
            <div className="bg-card rounded-lg shadow-md p-4">
              {/* Post Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <img 
                    src={post.profiles?.avatar_url || "/placeholder.svg"} 
                    alt={post.profiles?.username || "user"} 
                    className="object-cover"
                  />
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <Link to={`/perfil/${post.profiles?.username}`} className="font-semibold hover:underline">
                      {post.profiles?.username || "Usuário"}
                    </Link>
                    {post.profiles?.verified && (
                      <img src="/verificado.png" className="w-4 h-4" alt="Verificado" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              {/* Post Media */}
              {post.media_urls && post.media_urls.length > 0 && (
                <MediaCarousel mediaUrls={post.media_urls} />
              )}

              {/* Post Text Content */}
              <p className="my-4">{post.content}</p>

              {/* Post Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4">
                  <Tags tags={post.tags} />
                </div>
              )}

              {/* Instagram Post */}
              {post.instagram_post && (
                <div className="mb-4">
                  <InstagramPost postId={post.instagram_post} />
                </div>
              )}

              {/* Post Location */}
              {location && (
                <div className="mb-4">
                  <Button variant="outline" onClick={() => setShowMap(!showMap)}>
                    <MapPin className="w-4 h-4 mr-2" />
                    {showMap ? "Ocultar Mapa" : "Mostrar Localização"}
                  </Button>
                  {showMap && (
                    <div className="mt-2 rounded-md overflow-hidden">
                      <iframe
                        ref={mapRef}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps/embed/v1/place?key=${
                          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                        }&q=${location}`}
                      ></iframe>
                    </div>
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <button
                    className={`post-action ${isLiked ? "text-primary" : ""}`}
                    onClick={handleLike}
                  >
                    <Heart className="h-5 w-5" />
                    <span>{likeCount}</span>
                  </button>
                  <button className="post-action">
                    <MessageCircle className="h-5 w-5" />
                    <span>{comments.length}</span>
                  </button>
                  <button className="post-action">
                    <Share className="h-5 w-5" />
                    <span>Compartilhar</span>
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReactionMenu(true)}
                  className="hover:scale-105 transition-transform text-foreground"
                >
                  <ThumbsUp className="h-5 w-5" />
                </Button>
              </div>

              {/* Reaction Counters */}
              <div className="flex gap-2 mt-2">
                {Object.entries(reactionCounts).map(([reaction, count]) => (
                  <div key={reaction} className="reaction-counter">
                    <span>{emojiMap[reaction] || reaction}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
        
        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-4">Comentários ({comments.length})</h3>
          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
            {comments.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Seja o primeiro a comentar
              </p>
            )}
          </div>
        </div>
      </main>
      
      {/* Fixed Comment Bar - Only one comment input system */}
      <div className="fixed-comment-bar">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Avatar className="w-8 h-8">
            <img 
              src={user?.user_metadata?.avatar_url || "/placeholder.svg"} 
              alt={user?.user_metadata?.username || "user"} 
              className="object-cover"
            />
          </Avatar>
          <Textarea
            placeholder={replyingTo ? `Respondendo a @${replyingTo.username}...` : "Adicionar um comentário..."}
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <Button 
            className="comment-submit-button"
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {replyingTo && (
          <div className="text-xs text-primary flex items-center gap-1 mt-1 ml-10">
            <button 
              onClick={() => setReplyingTo(null)}
              className="underline"
            >
              Cancelar resposta
            </button>
            <span>para @{replyingTo.username}</span>
          </div>
        )}
      </div>
      
      <BottomNav />
      <ReactionMenu 
        visible={showReactionMenu} 
        onReaction={handleReaction} 
        onClose={() => setShowReactionMenu(false)}
      />
    </div>
  );
};

export default PostDetails;
